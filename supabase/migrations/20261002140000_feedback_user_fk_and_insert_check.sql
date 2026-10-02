-- feedback_user_fk_and_insert_check (Oct 2 2026)
--
-- Two changes to public.feedback that go with self-serve account deletion
-- (supabase/functions/delete-account):
--
-- 1. feedback_user_fk_cascade: feedback.user_id gets a foreign key to
--    auth.users with ON DELETE CASCADE, so deleting a login removes the notes
--    that login sent, enforced by the database itself - the same as profiles,
--    journal_entries, visit_days and email_log. It also covers a manual delete
--    from the dashboard. Anonymous notes (user_id NULL) are unaffected. On
--    2026-10-02, 0 feedback rows had a non-null user_id, so the constraint
--    validates instantly. The delete-account function still deletes feedback
--    rows explicitly first (belt-and-braces).
--
-- 2. feedback_insert_owner_check: the INSERT policy today checks only the body
--    length, so a crafted request could attach a note to someone else's user
--    id. The client never sends user_id (components/FeedbackForm.tsx inserts
--    { body, page }; the column defaults to auth.uid()), so real users are
--    unaffected, and anonymous inserts still pass because NULL is allowed.
--
-- ORDER: independent of the other Oct 2 migrations. Apply before or with the
-- front-end push that ships the profile page's "Delete my account". Run the
-- security advisor (get_advisors, security) after applying.

ALTER TABLE public.feedback
  ADD CONSTRAINT feedback_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER POLICY feedback_drop_insert ON public.feedback
  WITH CHECK (
    char_length(body) >= 3 AND char_length(body) <= 2000
    AND (user_id IS NULL OR user_id = (SELECT auth.uid()))
  );
