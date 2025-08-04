create extension if not exists "pgjwt" with schema "extensions";


drop policy "Allow user to view hosted events" on "public"."live_events";

drop policy "Allow user to view hosted rooms" on "public"."live_games";

drop policy "Allow users to view own profile" on "public"."profiles";

drop policy "Allow users to view own loqs" on "public"."quizzes";

drop policy "Allow users to view public loqs" on "public"."quizzes";

drop policy "Allow users to view own uploads" on "public"."user_image_uploads";

revoke delete on table "public"."live_events" from "anon";

revoke insert on table "public"."live_events" from "anon";

revoke references on table "public"."live_events" from "anon";

revoke select on table "public"."live_events" from "anon";

revoke trigger on table "public"."live_events" from "anon";

revoke truncate on table "public"."live_events" from "anon";

revoke update on table "public"."live_events" from "anon";

revoke delete on table "public"."live_events" from "authenticated";

revoke insert on table "public"."live_events" from "authenticated";

revoke references on table "public"."live_events" from "authenticated";

revoke select on table "public"."live_events" from "authenticated";

revoke trigger on table "public"."live_events" from "authenticated";

revoke truncate on table "public"."live_events" from "authenticated";

revoke update on table "public"."live_events" from "authenticated";

revoke delete on table "public"."live_events" from "service_role";

revoke insert on table "public"."live_events" from "service_role";

revoke references on table "public"."live_events" from "service_role";

revoke select on table "public"."live_events" from "service_role";

revoke trigger on table "public"."live_events" from "service_role";

revoke truncate on table "public"."live_events" from "service_role";

revoke update on table "public"."live_events" from "service_role";

revoke delete on table "public"."live_games" from "anon";

revoke insert on table "public"."live_games" from "anon";

revoke references on table "public"."live_games" from "anon";

revoke select on table "public"."live_games" from "anon";

revoke trigger on table "public"."live_games" from "anon";

revoke truncate on table "public"."live_games" from "anon";

revoke update on table "public"."live_games" from "anon";

revoke delete on table "public"."live_games" from "authenticated";

revoke insert on table "public"."live_games" from "authenticated";

revoke references on table "public"."live_games" from "authenticated";

revoke select on table "public"."live_games" from "authenticated";

revoke trigger on table "public"."live_games" from "authenticated";

revoke truncate on table "public"."live_games" from "authenticated";

revoke update on table "public"."live_games" from "authenticated";

revoke delete on table "public"."live_games" from "service_role";

revoke insert on table "public"."live_games" from "service_role";

revoke references on table "public"."live_games" from "service_role";

revoke select on table "public"."live_games" from "service_role";

revoke trigger on table "public"."live_games" from "service_role";

revoke truncate on table "public"."live_games" from "service_role";

revoke update on table "public"."live_games" from "service_role";

revoke delete on table "public"."live_rooms" from "anon";

revoke insert on table "public"."live_rooms" from "anon";

revoke references on table "public"."live_rooms" from "anon";

revoke select on table "public"."live_rooms" from "anon";

revoke trigger on table "public"."live_rooms" from "anon";

revoke truncate on table "public"."live_rooms" from "anon";

revoke update on table "public"."live_rooms" from "anon";

revoke delete on table "public"."live_rooms" from "authenticated";

revoke insert on table "public"."live_rooms" from "authenticated";

revoke references on table "public"."live_rooms" from "authenticated";

revoke select on table "public"."live_rooms" from "authenticated";

revoke trigger on table "public"."live_rooms" from "authenticated";

revoke truncate on table "public"."live_rooms" from "authenticated";

revoke update on table "public"."live_rooms" from "authenticated";

revoke delete on table "public"."live_rooms" from "service_role";

revoke insert on table "public"."live_rooms" from "service_role";

revoke references on table "public"."live_rooms" from "service_role";

revoke select on table "public"."live_rooms" from "service_role";

revoke trigger on table "public"."live_rooms" from "service_role";

revoke truncate on table "public"."live_rooms" from "service_role";

revoke update on table "public"."live_rooms" from "service_role";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

revoke delete on table "public"."quizzes" from "anon";

revoke insert on table "public"."quizzes" from "anon";

revoke references on table "public"."quizzes" from "anon";

revoke select on table "public"."quizzes" from "anon";

revoke trigger on table "public"."quizzes" from "anon";

revoke truncate on table "public"."quizzes" from "anon";

revoke update on table "public"."quizzes" from "anon";

revoke delete on table "public"."quizzes" from "authenticated";

revoke insert on table "public"."quizzes" from "authenticated";

revoke references on table "public"."quizzes" from "authenticated";

revoke select on table "public"."quizzes" from "authenticated";

revoke trigger on table "public"."quizzes" from "authenticated";

revoke truncate on table "public"."quizzes" from "authenticated";

revoke update on table "public"."quizzes" from "authenticated";

revoke delete on table "public"."quizzes" from "service_role";

revoke insert on table "public"."quizzes" from "service_role";

revoke references on table "public"."quizzes" from "service_role";

revoke select on table "public"."quizzes" from "service_role";

revoke trigger on table "public"."quizzes" from "service_role";

revoke truncate on table "public"."quizzes" from "service_role";

revoke update on table "public"."quizzes" from "service_role";

revoke delete on table "public"."user_image_uploads" from "anon";

revoke insert on table "public"."user_image_uploads" from "anon";

revoke references on table "public"."user_image_uploads" from "anon";

revoke select on table "public"."user_image_uploads" from "anon";

revoke trigger on table "public"."user_image_uploads" from "anon";

revoke truncate on table "public"."user_image_uploads" from "anon";

revoke update on table "public"."user_image_uploads" from "anon";

revoke delete on table "public"."user_image_uploads" from "authenticated";

revoke insert on table "public"."user_image_uploads" from "authenticated";

revoke references on table "public"."user_image_uploads" from "authenticated";

revoke select on table "public"."user_image_uploads" from "authenticated";

revoke trigger on table "public"."user_image_uploads" from "authenticated";

revoke truncate on table "public"."user_image_uploads" from "authenticated";

revoke update on table "public"."user_image_uploads" from "authenticated";

revoke delete on table "public"."user_image_uploads" from "service_role";

revoke insert on table "public"."user_image_uploads" from "service_role";

revoke references on table "public"."user_image_uploads" from "service_role";

revoke select on table "public"."user_image_uploads" from "service_role";

revoke trigger on table "public"."user_image_uploads" from "service_role";

revoke truncate on table "public"."user_image_uploads" from "service_role";

revoke update on table "public"."user_image_uploads" from "service_role";

alter table "public"."live_events" drop constraint "live_events_game_fkey";

alter table "public"."live_games" drop constraint "live_games_host_fkey";

alter table "public"."live_rooms" drop constraint "live_rooms_id_fkey";

alter table "public"."profiles" drop constraint "profiles_id_fkey";

alter table "public"."profiles" drop constraint "profiles_useranem_key";

alter table "public"."quizzes" drop constraint "quizzes_author_fkey";

alter table "public"."quizzes" drop constraint "quizzes_id_key";

alter table "public"."user_image_uploads" drop constraint "user_image_uploads_author_fkey";

drop function if exists "public"."create_profile_for_new_user"();

drop function if exists "public"."delete_quiz"(loq_id bigint);

drop function if exists "public"."generate_username_from_email"(email text);

drop function if exists "public"."get_user_info"(user_id uuid);

drop function if exists "public"."is_hosting"(room_id uuid);

drop function if exists "public"."live_create_room"();

drop function if exists "public"."live_generate_room_code"();

drop function if exists "public"."live_get_room_id"(room_code text);

drop function if exists "public"."live_join_room"(display_name text, room_id uuid);

drop function if exists "public"."live_remove_room"(room_id uuid);

drop function if exists "public"."live_submit_answer"(submitter_user_id uuid, room_id uuid, answer_content json);

drop function if exists "public"."remove_loq_image"(upload_id bigint);

drop function if exists "public"."search_public_quizzes"(page_number bigint, search_query_string text);

drop function if exists "public"."stop_hosting"();

drop function if exists "public"."update_username"(new_username text);

drop function if exists "public"."upload_loq"(loq_id bigint, loq_contents json);

drop function if exists "public"."upload_loq_image"(user_file_name text);

drop function if exists "public"."username_exists"(username_new text);

drop function if exists "public"."username_is_invalid"(username_new text);

alter table "public"."live_events" drop constraint "live_events_pkey";

alter table "public"."live_games" drop constraint "live_games_pkey";

alter table "public"."live_rooms" drop constraint "live_rooms_pkey";

alter table "public"."profiles" drop constraint "profiles_pkey";

alter table "public"."quizzes" drop constraint "quizzes_pkey";

alter table "public"."user_image_uploads" drop constraint "user_image_uploads_pkey";

drop index if exists "public"."live_events_pkey";

drop index if exists "public"."live_games_pkey";

drop index if exists "public"."live_rooms_pkey";

drop index if exists "public"."profiles_pkey";

drop index if exists "public"."profiles_useranem_key";

drop index if exists "public"."quizzes_id_key";

drop index if exists "public"."quizzes_pkey";

drop index if exists "public"."user_image_uploads_pkey";

drop table "public"."live_events";

drop table "public"."live_games";

drop table "public"."live_rooms";

drop table "public"."profiles";

drop table "public"."quizzes";

drop table "public"."user_image_uploads";

drop type "public"."visibility";


