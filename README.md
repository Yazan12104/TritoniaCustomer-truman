React Native Expo Starter Template

A reusable React Native (Expo + TypeScript) starter template
built to quickly convert Express.js / REST APIs into mobile apps.

Stack

Expo

React Native

TypeScript

Axios (API calls)

React Navigation (routing)

Zustand (state management)

-Installation
--npx create-expo-app rn-template --template expo-template-blank-typescript
cd rn-template

-Install core dependencies:

--npm install axios zustand
--npm install @react-navigation/native @react-navigation/native-stack
--npx expo install react-native-screens react-native-safe-area-context

Run:

--npm start

Project Structure
src/
├── api/ # API layer (axios, services)
├── screens/ # App screens (pages)
├── navigation/ # Navigation stacks
├── store/ # Global state (auth, user, etc.)
├── components/ # Reusable UI components
├── hooks/ # Custom hooks
├── config/ # Environment config
└── utils/ # Helpers

Architecture Idea

Backend:

Express.js → REST API

Mobile:

React Native → consumes API only

App acts as:

Client only

No business logic duplication

Easy to plug into any existing backend

Core Setup
API Layer

Centralized axios client.

src/config/env.ts

export const ENV = {
API_URL: "http://localhost:3000/api",
};

src/api/client.ts

import axios from "axios";
import { ENV } from "../config/env";

export const api = axios.create({
baseURL: ENV.API_URL,
timeout: 10000,
});

Why?

Change API once → whole app updates.

Navigation

Uses React Navigation.

Flow:

App
├── Auth Stack (Login/Register)
└── Main Stack (App screens)

Benefits:

Easy auth guard

Clean routing

Scalable for large apps

State Management

Using Zustand (lightweight alternative to Redux).

Example:

import { create } from "zustand";

export const useAuthStore = create(set => ({
token: null,
setToken: token => set({ token }),
}));

Why?

Simple

No boilerplate

Perfect for small/medium apps

Reusing This Template
Option A — Copy folder
cp -r rn-template myNewApp

Option B — GitHub template (recommended)

Push to GitHub:

react-native-starter-template

Then:

git clone <repo>

or use GitHub "Use this template"

How to Start a New Project

1. Clone template
2. Change API URL

src/config/env.ts

3. Add your screens
   src/screens/

4. Connect endpoints inside
   src/api/

Done

Optional Features (Future)

You can add later if needed:

JWT Authentication

Refresh tokens

Push notifications

WebView fallback mode

Environment configs (dev/staging/prod)

App generator scripts

CI/CD builds

Philosophy

This template is optimized for:

Speed
Reusability
Clean structure
Works with any Express backend

NOT optimized for:
Heavy native customization
Over-engineering

Keep it simple. Ship fast.
