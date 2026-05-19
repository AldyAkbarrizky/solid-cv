alter table "user_entitlements"
  alter column "review_quota_limit" set default 15;

update "user_entitlements"
set "review_quota_limit" = 15
where "plan_code" = 'free'
  and "review_quota_limit" < 15;
