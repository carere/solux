# Product Mission

## Pitch

Solux is a state management library for SolidJS that helps developers building highly dynamic applications (like Figma or complex SPAs) manage complex application state by providing a Redux-toolkit-like solution with full type safety and SolidJS reactivity.

## Users

### Primary Customers

- **Frontend Developers**: Engineers building complex, stateful SolidJS applications who need predictable state management
- **Application Architects**: Technical leads designing scalable frontend architectures for dynamic web applications
- **Enterprise Teams**: Development teams building production-grade single-page applications requiring robust state management

### User Personas

**Senior Frontend Developer** (28-40 years old)
- **Role:** Lead Frontend Engineer or Senior Developer
- **Context:** Building complex interactive applications like design tools, dashboards, or real-time collaboration platforms
- **Pain Points:** Managing complex state across components, handling async operations predictably, maintaining type safety
- **Goals:** Build maintainable applications, reduce bugs from state management, improve developer experience

**Application Architect** (32-45 years old)
- **Role:** Technical Lead or Frontend Architect
- **Context:** Designing architecture for large-scale SolidJS applications in enterprise settings
- **Pain Points:** Lack of mature state management solutions for SolidJS, difficulty scaling reactive applications, integrating with existing Redux knowledge
- **Goals:** Establish scalable patterns, enable team productivity, ensure code maintainability

## The Problem

### Lack of Redux-like State Management for SolidJS

SolidJS developers lack a comprehensive state management solution that matches Redux's maturity and patterns. Most teams have to build custom solutions or adapt React libraries, leading to inconsistent patterns and increased development time.

**Our Solution:** Solux provides a complete Redux-toolkit-like experience built specifically for SolidJS's reactive system.

### Complex Async State Management

Managing asynchronous operations in reactive applications often leads to race conditions, memory leaks, and unpredictable state updates. Developers spend significant time debugging async-related issues.

**Our Solution:** Built-in Epic system using RxJS provides predictable, composable async state management with proper cancellation and error handling.

### Type Safety in State Management

Many state management solutions sacrifice type safety for flexibility, leading to runtime errors and poor developer experience. This is especially problematic in large applications where state shape changes frequently.

**Our Solution:** Full TypeScript support with advanced type inference ensures compile-time safety for all state operations, events, and selectors.

## Differentiators

### Native SolidJS Integration

Unlike generic state management libraries or React ports, Solux is built specifically for SolidJS's fine-grained reactivity system. This results in optimal performance with minimal re-renders and seamless integration with SolidJS patterns.

### Redux DevTools Support

Unlike most SolidJS state solutions, we provide full Redux DevTools integration with time-travel debugging. This results in familiar debugging workflows and faster issue resolution for teams migrating from React/Redux.

### Built-in Entity Management

Unlike basic state managers that require custom normalization logic, Solux includes a complete entity adapter system. This results in 50% less boilerplate code for managing normalized data and consistent CRUD operations across the application.

## Key Features

### Core Features

- **Store Configuration:** Type-safe store creation with middleware and enhancer support
- **Slice Management:** Modular state organization with automatic type inference
- **Event System:** Type-safe event creators with payload preparation
- **Entity Adapter:** Built-in normalized state management with CRUD operations
- **Redux DevTools:** Full integration with time-travel debugging capabilities

### Advanced Features

- **Epic Middleware:** RxJS-based side effect middleware for complex async flows
- **Slice Combination:** Hierarchical state composition with type preservation
- **Custom Middleware:** Extensible middleware system for customizing dispatch
- **Custom Enhancer:** Extensible enhancer system for customizing the store