# GitHub Setup

Use this when the folder is not already a Git repository.

## New Repository For All Three Projects

```bash
git init
git add automation-projects-separated
git commit -m "Add separated automation project plans"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## New Repository For One Project Only

Example:

```bash
mkdir apartment-guest-messaging
cp -R automation-projects-separated/01-apartment-guest-messaging/* apartment-guest-messaging/
cd apartment-guest-messaging
git init
git add .
git commit -m "Add apartment guest messaging automation plan"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/apartment-guest-messaging.git
git push -u origin main
```

## Recommended GitHub Layout

```text
docs/
  automation-projects-separated/
src/
  api/
```

