# **App Name**: Terabound Admin Panel

## Core Features:

- Dashboard Overview: Provide platform administrators with a comprehensive, real-time view of total tenants, active tenants, subscription statistics, revenue overviews, and recent system activities.
- Tenant Administration: Allow administrators to list, view details, create new, edit existing, and suspend tenant accounts. This feature will invoke Cloud Functions for tenant provisioning and lifecycle management.
- Module Catalog Management: Enable management of the global `_gl_module_catalog` including adding new modules, updating existing module details (version, dependencies, remote URL), and activating/deactivating them.
- Subscription Plan Configuration: Facilitate the creation, modification, and deletion of `_gl_plans`, defining names, prices, included modules, and usage limits.
- Tenant Subscription Assignment: Provide tools to assign, modify, and view `_gl_subscriptions` for individual tenants, including updating their current plan, suspending subscriptions, and managing module activation status via Cloud Functions.
- Global Audit Log Viewer: Display a searchable and filterable log of all administrator actions within the BACKEN, stored in the `_gl_audit_logs` collection.
- AI-Powered Optimization Assistant: An AI tool that analyzes platform usage data to suggest optimal Firebase indexing strategies, propose scalability adjustments for Firestore collections based on access patterns, or recommend security rule improvements.

## Style Guidelines:

- Primary color: A rich, deep violet (#811EAF) for interactive elements, buttons, and primary highlights, chosen for its authoritative yet modern feel against a dark background.
- Background color: A very dark, subtle purple-gray (#1A161B), creating a sophisticated and data-focused dark theme base, derived from the primary hue but heavily desaturated.
- Accent color: A vibrant, clear blue (#4D4DFF) for secondary actions, data visualization lines, and critical alerts, providing high contrast and drawing attention when needed, analogously derived from the primary color.
- Headline and body font: 'Inter', a grotesque-style sans-serif for its clean, modern, and highly legible characteristics, suitable for data-dense dashboards and clear text communication.
- Employ a consistent set of minimal, solid-fill icons for navigation and actions, ensuring clarity and unobtrusiveness within the professional admin interface.
- Utilize a grid-based responsive layout for the dashboard and content areas, ensuring efficient data presentation, readability, and logical grouping of related information with a prominent sidebar for global navigation.
- Incorporate subtle animations for state changes, loading indicators, and component transitions to provide visual feedback without distracting from the core administrative tasks.