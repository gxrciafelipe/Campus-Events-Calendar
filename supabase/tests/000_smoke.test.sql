-- Smoke test: proves the pgTAP harness runs and the public schema exists.
begin;

select plan(2);

select has_schema('public', 'public schema exists');

select ok(true, 'pgTAP runs');

select * from finish();

rollback;
