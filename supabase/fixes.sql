-- Enable required extensions
create extension if not exists pgcrypto;

-- Fix policy names with quotes
drop policy if exists Userscanviewownprofile on profiles;
drop policy if exists Userscanupdateownprofile on profiles;
drop policy if exists Agentsreadassignedapplications on applications;
drop policy if exists Agentsupdateassignedapplicationsstatus/notesonly on applications;
drop policy if exists Usersmayinsertquotes on quotes;
drop policy if exists Readcalculatorconfig on calculator_config;

create policy Userscanviewownprofile on profiles for select using (auth.uid() = id);
create policy Userscanupdateownprofile on profiles for update using (auth.uid() = id);
create policy Agentsreadassignedapplications on applications for select using (assigned_agent_id = auth.uid());
create policy Agentsupdateassignedapplications on applications for update using (assigned_agent_id = auth.uid());
create policy Usersmayinsertquotes on quotes for insert with check (true);
create policy Readcalculatorconfig on calculator_config for select using (true);
