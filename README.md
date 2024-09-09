# Manga Tracker Bot

## Demo

[Telegram Bot](https://t.me/manga_tracker_bot)

## Problem

As a manga reader, I often struggle with knowing when new chapters will be released. Sometimes I read manga that aren't listed on platforms like MangaDEX, or those that are listed lack English translations. As a result, I rely on individual sites for specific manga, causing the list of URLs to grow over time, and I often lose track of them. This bot aims to consistently monitor the registered URLs for new releases by making GET requests and notifying users when a new chapter is available, using a daily cron job to check for updates.

## References

Telegraf Sessions - https://github.com/feathers-studio/telegraf-docs/blob/b694bcc36b4f71fb1cd650a345c2009ab4d2a2a5/guide/session.md
Cron job - https://github.com/kelektiv/node-cron/tree/main
