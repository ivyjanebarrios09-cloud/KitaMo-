# **App Name**: FinanceFlow

## Core Features:

- Dashboard: Display summary of all Financial Rooms with student count, funds collected, and unpaid balances.
- Create Financial Room: Allow financial chairpersons to create new rooms with a name, description, and auto-generated join code.
- Post Expenses: Enable chairpersons to post expenses with title, description, amount, and date, visible to all students in the room.
- Post Fund Deadlines: Allow chairpersons to post fund deadlines with amount per student, due date, and billing period, automatically calculating total expected collection and remaining balance. An AI tool will review fund deadlines, looking for ways the wording may cause unintentional stress to students.
- Manage Students: Enable chairpersons to view a list of joined students with their amount paid, remaining balance, and payment history. Chairpersons can also mark payments as received.
- Student Join Room: Allow students to join a financial room using the unique room code.
- Firebase Authentication: Implement Firebase Authentication (email/password) for user authentication.
- Join Financial Room: Allow student to input join code, validate room existence and prevent duplicate joins
- Student Dashboard: Show current month balance, total amount paid, remaining balance and payment progress bar
- View Expenses: List all expenses posted by the chairperson, sort by date and show total expenses for the month
- View Fund Deadlines: Show upcoming deadlines and overdue payments highlighted and amount required vs amount paid
- Landing Page: Simple landing page with sign in and log in in the upper right side. After logging in the user can choose if they are student or financial chairperson then will proceed to the dashboard of chosen role

## Style Guidelines:

- Primary color: Deep Indigo (#667EEA) for a sense of trust and sophistication.
- Background color: Very light gray (#F7FAFC), nearly white, to provide a clean backdrop that ensures readability and focuses user attention.
- Accent color: Soft Blue (#90CDF4) to provide visual interest, while complementing the primary and background.
- Body and headline font: 'Inter' for a modern, neutral, and highly readable interface.
- Use clean and consistent icons from a library like FontAwesome or Material Design Icons.
- Mobile-first responsive design using Tailwind CSS grid and flexbox.
- Subtle transitions and animations for user interactions to provide a smooth experience.