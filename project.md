# STEPWISE

A cross-platform productivity operating system for long-term learning.

---

## Vision

STEPWISE is not a todo app.

It is a progression tracker.

Everything revolves around measurable progress.

Goals are broken into subjects.

Subjects are broken into milestones.

Progress is generated automatically from logs.

No manual percentage updating.

Everything derives from actual work.

---

# Core Principles

- Log once.
- Update everywhere.
- Everything interconnected.
- Mobile first.
- Offline capable.
- Beautiful analytics.
- Minimal friction.

---

# Tech Stack

Frontend
- Next.js 15
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion

Backend

- Supabase

Database

- PostgreSQL

Authentication

- Supabase Auth

Charts

- Tremor
- Recharts

State

- Zustand

Forms

- React Hook Form

Validation

- Zod

Deployment

- Vercel

PWA Support

- next-pwa

---

# Database Design

Goals

id

title

type

target

current

deadline

status

icon

color

xp

created_at

updated_at

---

Subjects

id

goal_id

title

hours_target

hours_completed

checkpoint

status

---

Topics

id

subject_id

title

completed

notes

---

LectureLogs

id

subject_id

topic_id

date

hours

remarks

---

WeeklyReviews

id

week

study_hours

jp_hours

gate_hours

gym_sessions

rating

reflection

---

JapaneseResources

id

level

resource_type

title

target

completed

---

FitnessLogs

id

weight

bench

shoulder_press

steps

calories

date

---

Projects

id

title

progress

github

deadline

status

---

Roadmap

id

month

goal

priority

status

---

Achievements

id

title

xp

description

icon

---

# Data Flow

Lecture Log

↓

Subject Hours

↓

Goal Completion

↓

Dashboard

↓

Statistics

↓

Achievements

One entry updates everything.

---

# Japanese Module

N5

Grammar PDFs

Target PDFs

Completed PDFs

Progress

Notes

---

N4

Same.

---

N3

Grammar

Reading Hours

Listening Hours

Novel Progress

Media Consumed

No vocabulary tracking.

Progress derives from hours.

---

# GATE

Two tracks.

## GATE CS

Engineering Mathematics

Linear Algebra

Calculus

Probability

Statistics

Differential Equations

Numerical Methods

Discrete Maths

Programming

DSA

Algorithms

COA

OS

DBMS

CN

TOC

Compiler

Digital Logic

General Aptitude

---

## GATE DA / AI

Python

Statistics

Probability

Linear Algebra

Calculus

Optimization

Machine Learning

Deep Learning

Artificial Intelligence

Data Science

SQL

Visualization

---

Each subject contains

Hours Target

Hours Done

Checkpoint

20%

40%

60%

80%

100%

Topics (reference only)

No checkpoints per topic.

---

# Dashboard

Cards

Overall Progress

Study Hours

Current Streak

Weekly Goal

Monthly Goal

Japanese Progress

Gate Progress

Fitness Progress

Project Progress

Roadmap

Recent Activity

Quick Actions

---

# Analytics

Study Hours

Daily

Weekly

Monthly

Heatmap

Contribution Graph

Pie Charts

Subject Breakdown

Trend Lines

Goal Prediction

Estimated Completion

---

# Fitness

Weight Chart

Strength PRs

Bench

OHP

Squat

Deadlift

Weekly workouts

Calories

Steps

---

# XP System

Every action gives XP.

Study Hour

+10

Complete PDF

+40

Gym Session

+25

Weekly Review

+75

Finish Subject

+300

Finish Goal

+1000

Levels

unlock themes

unlock badges

unlock achievements

---

# Roadmap

Separate page.

Timeline

August

September

October

November

December

January

Goals

Status

Priority

Completion

---

# Quick Add

Single floating button.

+

Study Session

Workout

PDF Finished

Project Update

Roadmap Update

Everything else updates automatically.

---

# Future Integrations

GitHub

Google Calendar

Google Tasks

Spotify

Anki

Jisho

YouTube

MAL

Steam

LeetCode

GitHub Contribution

Google Drive PDFs

---

# Design

Black

White

Accent color per goal.

Glassmorphism.

Motion inspired by Linear.

Cards inspired by GitHub Projects.

Charts inspired by GitHub Insights.

Everything responsive.

Desktop

Tablet

Phone

PWA installable.

---

# Rule

Never manually edit percentages.

Every chart.

Every progress bar.

Every badge.

Every dashboard card.

Must derive from stored data.
