ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kek_country_code text CHECK (kek_country_code IS NULL OR kek_country_code ~ '^[A-Z]{2}$');
CREATE OR REPLACE FUNCTION public.kek_post_scoreboard()
RETURNS TABLE(username text, posts bigint, country_code text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT p.user_id AS username, count(*) AS posts, pr.kek_country_code AS country_code
  FROM public.posts p
  LEFT JOIN public.profiles pr ON pr.display_name = p.user_id
  WHERE p.site = 'kak' AND p.deleted_at IS NULL
    AND (p.scheduled_at IS NULL OR p.scheduled_at <= now())
  GROUP BY p.user_id, pr.kek_country_code
  ORDER BY count(*) DESC, p.user_id ASC;
$$;
GRANT EXECUTE ON FUNCTION public.kek_post_scoreboard() TO anon, authenticated, service_role;