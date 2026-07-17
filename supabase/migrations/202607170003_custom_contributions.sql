alter table public.opinion_contributions
  drop constraint if exists opinion_contributions_amount_lamports_check;

alter table public.opinion_contributions
  add constraint opinion_contributions_amount_lamports_check
  check (amount_lamports between 1000000 and 1000000000);
