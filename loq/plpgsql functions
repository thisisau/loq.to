-- Test if username exists function
create or replace function public.username_exists (username_new TEXT) returns boolean
set search_path = '' as $$ BEGIN return EXISTS(
    SELECT 1
    FROM public.profiles
    WHERE LOWER(username) = LOWER(username_new)
      and id <> auth.uid()
  );
END;
$$ language plpgsql security DEFINER;
-- Test if username is valid function
create or replace function public.username_is_invalid (username_new TEXT) returns boolean
set search_path = '' as $$ BEGIN return public.username_exists(username_new)
  or username_new ~ '[^a-zA-Z0-9_\-\.]|^_|_$|[-_\.]{2}'
  or length(username_new) > 16
  OR length(username_new) < 3;
END;
$$ language plpgsql security definer;
-- Generate username from email function
create or replace function public.generate_username_from_email(email TEXT) returns text
set search_path = '' as $$
declare username_attempt TEXT;
replaced_email TEXT;
BEGIN replaced_email := replace(email, '+', '');
username_attempt := substring(
  replaced_email,
  1,
  POSITION('@' IN replaced_email) -1
);
if public.username_is_invalid (username_attempt) then -- loop_attempt:
loop username_attempt := 'user_' || to_char(trunc(random() * 100000000), 'FM00000000');
if not public.username_is_invalid (username_attempt) then exit;
end if;
end loop;
end if;
return username_attempt;
END;
$$ language plpgsql security definer;
-- Create profile for new user function
create or replace function public.create_profile_for_new_user () returns trigger
set search_path = '' as $$
declare generated_username text;
BEGIN generated_username := public.generate_username_from_email(NEW.email);
INSERT INTO public.profiles (id, display_name, username)
VALUES (NEW.id, generated_username, generated_username);
RETURN NEW;
END;
$$ language plpgsql security definer;
create trigger create_profile_from_auth
after
insert on auth.users for each row execute function public.create_profile_for_new_user();
-- Allow user to change username
create or replace function public.update_username(new_username text) returns void
set search_path = '' as $$ BEGIN if public.username_exists(new_username) then RAISE EXCEPTION SQLSTATE '90000' using message = 'This username is taken.';
end if;
if public.username_is_invalid(new_username) then RAISE EXCEPTION SQLSTATE '90001' using message = 'This username is invalid.';
end if;
update public.profiles
set username = new_username
where id = auth.uid();
end;
$$ language plpgsql security definer;
-- Upload LOQ function
create or replace function public.upload_loq(loq_id int8, loq_contents json) returns int8
set search_path = '' as $$
declare now_timestamp TIMESTAMP;
upload_cutoff TIMESTAMP;
new_id int8;
recent_count int;
BEGIN if auth.role() != 'authenticated' then raise exception sqlstate '90100' using message = 'You must be signed in to upload a loq!';
end if;
now_timestamp := NOW();
upload_cutoff := now_timestamp - INTERVAL '15 minutes';
SELECT COUNT(*) into recent_count
FROM public.quizzes
WHERE quizzes.created_at > upload_cutoff
  and quizzes.author = auth.uid();
if recent_count >= 5 then RAISE EXCEPTION SQLSTATE '90101' using message = 'You have uploaded 5 loqs in the past 15 minutes. Please wait a few minutes before uploading another loq.';
end if;
if (
  (loq_id is null)
  or not exists(
    select 1
    from public.quizzes
    where author = auth.uid()
      and id = loq_id
  )
) then
insert into public.quizzes (
    author,
    title,
    quiz_description,
    visibility,
    copy_protect,
    thumbnail,
    contents,
    last_updated
  )
VALUES (
    auth.uid(),
    loq_contents#>>'{settings,title}',
    loq_contents#>>'{settings,description}',
    (loq_contents#>>'{settings,options,visibility}')::public.visibility,
    (loq_contents#>>'{settings,options,copyProtect}')::boolean,
    to_jsonb(loq_contents#>>'{settings,thumbnail}'),
    loq_contents,
    NOW()
  )
returning id into new_id;
return new_id;
else
update public.quizzes
set title = loq_contents#>>'{settings,title}',
  quiz_description = loq_contents#>>'{settings,description}',
  visibility = (loq_contents#>>'{settings,options,visibility}')::public.visibility,
  copy_protect = (loq_contents#>>'{settings,options,copyProtect}')::boolean,
  thumbnail = (to_jsonb(loq_contents#>>'{settings,thumbnail}')),
  contents = loq_contents,
  last_updated = NOW()
where id = loq_id
returning id into new_id;
if new_id is null then raise exception sqlstate '90102' using message = 'No such loq found for update.';
end if;
return new_id;
end if;
end;
$$ language plpgsql security definer;
-- Get user info function
create or replace function get_user_info (user_id uuid) returns json
set search_path = '' language sql security definer as $$
select coalesce(
    (
      select json_build_object(
          'id',
          id,
          'display_name',
          display_name,
          'username',
          username
        )
      FROM public.profiles
      where id = user_id
    ),
    json_build_object(
      'id',
      user_id,
      'display_name',
      'Unknown User',
      'username',
      'deleted'
    )
  ) $$;
-- Delete loq function
create or replace function delete_quiz (loq_id int8) returns void
set search_path = '' as $$
BEGIN
  IF not exists(
    select 1
    from public.quizzes
    where author = auth.uid()
      and id = loq_id
  ) then
    raise exception sqlstate '90103' using message = 'You are not the owner of this loq.';
  end if;
  delete from public.quizzes where id = loq_id;
end;
$$
language plpgsql security definer;