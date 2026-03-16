# Seed & Succeed

Seed & Succeed is a habit tracker app where each habit you create grows its own plant. As you log daily completions, your plant progresses through 7 growth stages — from a tiny seed all the way to a full tree. Maintaining streaks earns you growth multipliers (up to 4x), so consistency is rewarded with faster-growing plants. The app features animated SVG plants, a garden view showing all your habits as plants, streak tracking, a 90-day heatmap calendar, and confetti celebrations when your plant reaches a new stage.

## Why I Built This

I built this project to learn how to use SQL for persistent data storage. Instead of relying on browser localStorage, the app uses a **SQLite** database on the backend to store, retrieve, update, and delete all habit and completion data. This gave me hands-on experience writing SQL queries for CRUD operations, designing a relational schema with foreign keys, and connecting a database to a web application through a REST API.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Python, Flask
- **Database:** SQLite
- **Build Tool:** Vite
