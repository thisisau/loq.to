-- Create room function
create or replace function live_create_room () returns json
set search_path = '' as $$
declare room_code TEXT;
declare room_id UUID;
BEGIN
if auth.role() != 'authenticated' then raise exception sqlstate '90200' using message = 'You must be signed in to host a loq!'; end if;
  if exists(
    select 1
    from public.live_games
    where host = auth.uid()
  ) then
    raise exception sqlstate '90201' using message = 'You are already hosting a game!';
  end if;
  room_code := public.live_generate_room_code();
  room_id := gen_random_uuid();
  insert into public.live_games (
    id
  ) values (
    room_id
  );
  insert into public.live_rooms (
    code,
    id
  ) values (
    room_code,
    room_id
  );
  insert into public.live_events (
    game,
    event_type
  ) values (
    room_id,
    'game_create'
  );
  return json_build_object(
          'id',
          room_id,
          'code',
          room_code
  );
end;
$$
language plpgsql security definer;

-- Generate room code function
create or replace function live_generate_room_code () returns text
set search_path = '' as $$
declare room_code_attempt text;
BEGIN
  loop
    room_code_attempt := to_char(trunc(random() * 90000 + 10000), 'FM00000');
    if not 
      exists(select 1 from public.live_rooms where code = room_code_attempt) then exit;
    end if;
  end loop;
  return room_code_attempt;
end;
$$
security invoker language plpgsql;

-- Get room ID function
create or replace function live_get_room_id (room_code text) returns uuid
set search_path = '' as $$
declare room_id uuid;
BEGIN
  select id from public.live_rooms where code = room_code into room_id;
  if room_id is null then
    raise exception sqlstate '90301' using message = 'Could not find the specified room code.';
  end if;
  return room_id;
end;
$$
security definer language plpgsql;

-- Join game function
create or replace function live_join_room (display_name text, room_id uuid) returns json
set search_path = '' as $$
declare new_user_id uuid;
user_join_payload json;
BEGIN
  display_name := trim(display_name);
  if length(display_name) < 1 or length(display_name) > 20 then
    raise exception sqlstate '90302' using message = 'Your name must be 1-20 characters long.';
  end if;
  if not exists (
    select 1 from public.live_games
    where id = room_id
  ) then
   raise exception sqlstate '90304' using message = 'No room with the given ID was found.';
  end if;
  if exists(
    select 1 from public.live_events
    where game = room_id
    and event_type = 'user_join'
    and lower(payload#>>'{display_name}') = lower(display_name)
  ) then
    raise exception sqlstate '90303' using message = 'A user with this name already exists!';
  end if;
  new_user_id := gen_random_uuid();
  user_join_payload := json_build_object(
    'user_id', new_user_id,
    'display_name', display_name
  );
  insert into public.live_events (
    game,
    user_id,
    event_type,
    payload
  ) values (
    room_id,
    new_user_id,
    'user_join',
    user_join_payload
  );
  return user_join_payload;
end;
$$
security definer language plpgsql;