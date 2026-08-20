# Coding Standards & Engineering Instructions

This is your extensive coding standard, that you must follow.

## 2.1 Core Philosophy

Write software that is:

- Simple
- Explicit
- Modular
- Readable
- Testable
- Maintainable
- Reusable where appropriate

Do not optimize for cleverness. Do not complicate the code by breaking it down into multiple isolated functions. Prefer simpler working code before highly modularized functional code. Do not introduce complexity simply because a design pattern exists. Prefer code where another engineer can quickly understand.

The goal is not to produce the most sophisticated architecture. The goal is to produce the simplest architecture that correctly represents the problem.

---

## 2.2 Design Before Implementation

Do not immediately write full implementations. Development follows:

```text
Requirements
     |
     v
Design
     |
     v
Contracts
     |
     v
Skeleton
     |
     v
Wire Components
     |
     v
Validate Architecture
     |
     v
User Confirmation
     |
     v
Implementation
     |
     v
Tests
```

When building a meaningful feature, begin with a design document. Do not hide unclear architecture underneath implementation code.

---

## 2.3 Design Document

The design document should define, where relevant:

### Problem

What are we solving?

Why does the problem exist?

### Requirements

What must the system support?

### Non-Requirements

What deliberately remains outside the scope?

### Constraints

What technical, business, operational, or organizational constraints exist?

### Entities

What important domain concepts exist?

### Responsibilities

Which component owns which responsibility?

### Knowledge Boundaries

What information belongs inside each component?

What information should remain outside it?

### Components

What modules, classes, services, or processes are required?

### Contracts

How do components communicate?

### Interfaces

What behavior is promised?

### Data Records

What information crosses boundaries?

### Validation

Where and how is data validated?

### Pipeline

How does information move through the system?

### Dependencies

Which components depend on which other components?

### Errors

What can fail and how are failures represented?

### Logging

What operational information should be recorded?

### Observability

What metrics, traces, logs, and health information are necessary?

### Testing

Which boundaries should be independently testable?

### Security

What authentication, authorization, secrets, or data-protection concerns exist?

### Deployment

How will the application run in production?

### Tradeoffs

What alternatives were considered?

Why was the proposed approach selected?

---

## 2.4 Knowledge Boundaries

Every component should have an understandable knowledge boundary.

Ask:

> What does this component need to know to perform its responsibility?

Then ask:

> What information can we prevent it from knowing?

Example:

```text
HTTP Layer
   |
   | HTTP knowledge
   v
Application Layer
   |
   | use-case knowledge
   v
Domain
   |
   | business knowledge
   v
Persistence Boundary
   |
   | storage contract
   v
Database Adapter
   |
   | PostgreSQL knowledge
   v
PostgreSQL
```

Do not allow implementation details to leak upward unnecessarily.

---

## 2.5 Contracts Before Implementations

Define communication boundaries before implementation details.

For example:

```text
interface PaymentGateway
        |
        +-- charge()
        +-- refund()
```

Then implementations:

```text
PaymentGateway
      ^
      |
 +----+-----+
 |          |
Stripe    PayPal
```

Consumers depend on the contract. They should not need to understand implementation details. However, do not introduce an interface merely because an implementation exists. The abstraction must represent a meaningful boundary.

---

## 2.6 Data Contracts

Data crossing architectural boundaries should have explicit representations.

Examples:

```text
CreateOrderRequest

Order

OrderRecord

OrderResponse

PaymentResult
```

Do not casually pass arbitrary dictionaries/maps across the entire application.

A data contract communicates:

> This is the information this boundary promises to understand.

Different representations may exist for different boundaries.

For example:

```text
HTTP Request
     |
     v
CreateOrderRequest
     |
     v
Order
     |
     v
OrderRecord
     |
     v
Database
```

These records do not need to be identical simply because they contain similar information.

Each belongs to a different knowledge boundary.

---

## 2.7 Entities

Create entities when data and behavior naturally belong together.

Example:

```text
Order

attributes:
    items
    status
    total

behaviors:
    add_item()
    cancel()
    calculate_total()
```

Do not create classes merely because Object-Oriented Programming exists.

A class should represent a meaningful concept, responsibility, or lifecycle.

Do not turn every data structure into a class with getters and setters.

---

## 2.8 Functions

Do not create functions for every few lines of code.

Extract a function when doing so provides something meaningful:

- A reusable operation
- A meaningful name for an operation
- Isolation of complexity
- A clear knowledge boundary
- Easier testing
- Removal of genuine duplication

Avoid abstraction for abstraction's sake.

A short piece of obvious code can remain inline when extracting it would make the flow harder to follow.

---

## 2.9 Interfaces

Use interfaces when a meaningful boundary or replaceable behavior exists.

Good examples may include:

```text
PaymentGateway
NotificationSender
UserRepository
ObjectStorage
Clock
```

Avoid interfaces that merely mirror a single class without providing a useful architectural boundary.

Before creating an interface ask:

> What knowledge or implementation detail am I protecting the consumer from?

If there is no meaningful answer, the interface may not be necessary.

---

## 2.10 Dependency Direction

High-level business logic should not unnecessarily depend on infrastructure details.

Prefer:

```text
OrderService
      |
      v
OrderRepository
      ^
      |
PostgresOrderRepository
```

instead of:

```text
OrderService
      |
      v
Postgres
```

when the abstraction provides a genuine boundary.

But do not introduce interfaces automatically.

The boundary should earn its existence.

---

## 2.11 Validation

Validate information at appropriate boundaries.

Example:

```text
HTTP Request
     |
     v
Request Validation
     |
     v
Application
     |
     v
Domain Invariants
     |
     v
Persistence
```

Different validations belong to different knowledge boundaries.

For example:

```text
email is syntactically valid
```

may belong to request or domain validation.

Whereas:

```text
email already exists
```

requires application/database knowledge.

Do not mix these concerns blindly.

Distinguish between:

- Structural validation
- Format validation
- Domain invariants
- Business rules
- Persistence constraints
- Authorization rules

---

## 2.12 API Design

APIs should expose clear contracts.

Consider explicitly:

- Request structure
- Response structure
- HTTP semantics
- Validation
- Authentication
- Authorization
- Error representation
- Idempotency
- Pagination
- Versioning
- Rate limiting
- Timeouts
- Observability
- Backward compatibility

Avoid leaking internal implementation structures directly through external APIs.

An API is a contract with consumers.

Treat changes to that contract deliberately.

---

## 2.13 Error Handling

Errors should respect architectural boundaries.

Infrastructure errors should not automatically leak into higher-level contracts.

For example:

```text
PostgreSQL UniqueViolation
        |
        v
Repository
        |
        v
EmailAlreadyExists
        |
        v
Application
        |
        v
HTTP 409 Conflict
```

Each boundary translates the failure into terminology understood by the next boundary.

Do not use exceptions as uncontrolled cross-layer communication.

---

## 2.14 Logging

Logging should help answer operational questions. Always prefer logging in JSON string formats, so that those json objects can be ingested by any observability platform.

Useful logs describe:

```text
What happened?

Where did it happen?

What operation was being performed?

What important decision was made?

What failed?

Why did it fail?

How can the operation be correlated with other events?
```

Prefer structured logging where appropriate. Do not fill applications with meaningless logs such as:

```text
Entering function
Leaving function
Processing data
```

Log meaningful:

- State transitions
- Decisions
- Boundary interactions
- External calls
- Failures
- Retries
- Important lifecycle events

Never log secrets or sensitive information unnecessarily. Use correlation/request identifiers where they improve traceability.

---

## 2.15 Comments

Comments should explain **why**, not repeat **what** the syntax already says.

Bad:

```python
# Increment count by one
count += 1
```

Better:

```python
# Retries include the original request, so only increment
# after the first attempt fails.
retry_count += 1
```

During scaffolding, comments may additionally explain the intended responsibility of incomplete components.

Prefer readable code over comments that compensate for confusing code.

---

## 2.16 Scaffolding Before Full Implementation

After the design is agreed upon, create the skeleton first. Add logs and comments in the scafolding code so that we have a skeletal working type ready that is directed via the logs. Once the user is fine with the skeleton, then we can start with the implementation.

Example:

```text
src/
|
+-- api/
|   +-- order_controller.py
|
+-- domain/
|   +-- order.py
|
+-- services/
|   +-- order_service.py
|
+-- repositories/
|   +-- order_repository.py
|   +-- postgres_order_repository.py
|
+-- contracts/
    +-- create_order_request.py
    +-- order_response.py
```

Initially establish:

- Classes
- Interfaces
- Method signatures
- Contracts
- Dependencies
- Logging points
- TODO comments
- Placeholder implementations

The purpose of scaffolding is to validate the shape of the system before investing in detailed implementations.

---

## 2.17 Connect the System Before Filling It In

The skeleton should demonstrate that the architecture connects end-to-end.

For example:

```text
HTTP
 |
 v
Controller
 |
 v
Service
 |
 v
Repository Interface
 |
 v
Temporary Repository
```

A temporary implementation can initially return deterministic or placeholder data.

The objective is to validate:

> Do our components actually fit together?

before spending time implementing them.

Prefer a thin vertical slice through the entire architecture over completing one isolated layer at a time.

---

## 2.18 Implementation Requires Confirmation

For substantial coding tasks, stop after presenting:

1. Requirements
2. Design
3. Contracts
4. Architecture
5. Skeleton/scaffolding
6. Component wiring

Do not proceed into the full implementation until the user confirms the direction.

This prevents implementation effort from hiding architectural mistakes.

Once confirmed, implementation can proceed incrementally.

---

## 2.19 Testing Philosophy

Tests should primarily protect behavior and boundaries.

Focus on:

- Business rules
- Contracts
- Edge cases
- Failure behavior
- Integration boundaries
- Important invariants

Avoid tests whose only purpose is increasing coverage percentages.

A good test explains an expected behavior.

Prefer tests that survive reasonable internal refactoring.

Do not unnecessarily test private implementation details.

---

## 2.20 Containers and Deployment

Production-oriented applications should consider the runtime environment from the beginning.

Where appropriate, define:

```text
Application
     |
     v
Container
     |
     v
Configuration
     |
     v
Runtime Environment
     |
     v
Deployment
     |
     v
Observability
```

Consider:

- Docker images
- Environment configuration
- Secrets
- Health checks
- Readiness checks
- Graceful shutdown
- Resource limits
- Logging
- Metrics
- Tracing
- Deployment strategy
- Rollback strategy

Deployment is part of software engineering, not something that begins after coding finishes.

---

## 2.21 Reusability

Before creating reusable abstractions, ask:

> What exactly is being reused?

Prefer reuse of stable concepts and contracts.

Do not create generic abstractions merely because two pieces of code currently look similar.

Duplicating five obvious lines can sometimes be cheaper than introducing the wrong abstraction.

A useful progression is:

```text
First occurrence
      |
      v
Write simple code

Second occurrence
      |
      v
Observe similarity

Third / stable occurrence
      |
      v
Understand shared concept

      |
      v
Consider abstraction
```

Do not confuse visual similarity with conceptual sameness.

---

## 2.22 Modularity

Modules should represent coherent responsibilities. A module should ideally answer:

> What concept or responsibility does this module own?

Avoid utility modules that gradually become dumping grounds:

```text
utils.py
helpers.py
common.py
misc.py
```

when the contained behavior actually belongs to identifiable domains or components.

Prefer organizing code around meaningful concepts and boundaries.

---

## 2.23 Naming

Names should communicate intent.

Prefer:

```text
calculate_order_total()
send_password_reset_email()
find_active_subscription()
```

over:

```text
process()
handle()
execute()
do_work()
```

Generic names are acceptable when the surrounding abstraction already provides the missing context.

Do not make names unnecessarily verbose merely to avoid all ambiguity.

---

## 2.24 Configuration and Secrets

Configuration should remain separate from application logic. Do not hard-code environment-specific values.

Examples include:

- Database URLs
- API endpoints
- Credentials
- Feature flags
- Timeout values
- Environment-specific settings

Secrets must never be committed to source code.

The application should receive environment-specific configuration through clearly defined mechanisms.

---

## 2.25 External Dependencies

Treat external systems as boundaries.For I/O based operations, suggest the user to prefer to use async approaches.

Examples:

- Databases
- Third-party APIs
- Message brokers
- File storage
- LLM providers
- Payment processors
- Email providers

Ask:

> What happens if this dependency is slow?

> What happens if it is unavailable?

> What happens if it returns malformed data?

> What happens if the request succeeds but our process crashes before recording the result?

Consider where appropriate:

- Timeouts
- Retries
- Backoff
- Circuit breaking
- Idempotency
- Validation
- Failure translation
- Observability

Do not assume the network is reliable.

---

## 2.26 Security Boundaries

Authentication answers:

> Who are you?

Authorization answers:

> Are you allowed to perform this action?

Do not confuse the two. Security-sensitive decisions should occur at explicit boundaries. Validate all externally supplied information. Use least privilege.

Do not expose:

- Secrets
- Credentials
- Internal stack traces
- Sensitive user information
- Internal implementation details

unless explicitly required by a trusted contract.

---

## 2.27 Observability

Production systems should make their behavior understandable.

Think in terms of:

```text
Logs
  |
  +-- What happened?

Metrics
  |
  +-- How often / how much?

Traces
  |
  +-- Where did the time go?

Health checks
  |
  +-- Can this instance serve traffic?
```

Observability should help diagnose systems without requiring engineers to reproduce every production failure locally.

---

## 2.28 Complexity Rule

Every abstraction has a cost.

Every:

- Class
- Interface
- Service
- Framework
- Layer
- Queue
- Database
- Microservice
- Design pattern

introduces some amount of cognitive or operational complexity.

Therefore:

> Introduce complexity only when it removes greater complexity elsewhere.

A simple implementation with some duplication is often preferable to an elaborate abstraction whose purpose is unclear.

Do not optimize architecture for hypothetical requirements without evidence that those requirements are likely.

---

## 2.29 Final Engineering Principle

The final objective is not to produce the most architecturally sophisticated system.

It is not to maximize:

- Number of classes
- Number of interfaces
- Number of services
- Number of design patterns
- Number of abstractions
- Number of technologies

The objective is to produce the:

> **Simplest system whose responsibilities, contracts, and knowledge boundaries remain clear as the software evolves.**

When choosing between two designs, prefer the one that allows another engineer to understand the system with less context while still satisfying the real requirements.

Good software should feel understandable.

Good architecture should make incorrect dependencies difficult.

Good abstractions should hide knowledge that consumers do not need.

Good code should make the important behavior obvious.

And every piece of complexity should be able to answer one question:

> **Why do you need to exist?**