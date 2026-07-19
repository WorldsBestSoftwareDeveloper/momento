# Momento Architecture Diagrams

These Mermaid diagrams render natively on GitHub and describe the primary system path and the four judge-critical flows.

## System architecture

```mermaid
flowchart TD
    User[User] --> Frontend[Next.js Frontend]
    Frontend --> Routes[API Routes]
    Routes --> TxLINE[TxLINE API]
    TxLINE --> Supabase[Supabase]
    Supabase --> Solana[Solana optional rewards]

    Routes -. normalized match data .-> Frontend
    Supabase -. Realtime updates .-> Frontend
    Frontend -. signed Devnet transaction .-> Solana
```

> The vertical solid path is the requested high-level judging view. Dashed edges clarify runtime responses: Next.js normalizes TxLINE data, Supabase publishes community updates, and the browser signs optional Solana transactions.

## Replay Mode

```mermaid
sequenceDiagram
    actor User
    participant UI as Next.js Frontend
    participant API as API Routes
    participant Tx as TxLINE API
    participant DB as Supabase
    User->>UI: Open match with mode=replay
    UI->>API: Request fixture and historical timeline
    API->>Tx: Fetch snapshot and historical events
    Tx-->>API: Official fixture data
    API-->>UI: Normalized replay state
    UI->>DB: Load Moments, comments, and Champions
    DB-->>UI: Historical community state
    UI-->>User: Render complete wallet-free replay
```

## Live Mode

```mermaid
sequenceDiagram
    actor User
    participant UI as Next.js Frontend
    participant API as API Routes
    participant Tx as TxLINE API
    participant DB as Supabase
    participant SOL as Solana Devnet
    User->>UI: Open match with mode=live
    UI->>API: Subscribe to live match state
    API->>Tx: Snapshot plus score stream
    Tx-->>API: Official events
    API-->>UI: Normalized progressive updates
    UI->>DB: Subscribe to community activity
    DB-->>UI: Realtime Moments, Champions, and Support
    opt User supports a Moment
        UI->>SOL: Request signed Devnet transfer
        SOL-->>UI: Confirmed signature
        UI->>DB: Persist confirmed contribution
        DB-->>UI: Broadcast updated Support Pool
    end
```

## Upload Flow

```mermaid
sequenceDiagram
    actor Creator
    participant UI as Next.js Frontend
    participant API as API Routes
    participant Storage as Supabase Storage
    participant DB as Supabase Database
    Creator->>UI: Select a short MP4 reaction
    UI->>API: Request upload intent
    API-->>UI: Validated upload details
    UI->>Storage: Upload media
    Storage-->>UI: Public media URL
    UI->>API: Create Moment with event context
    API->>DB: Persist Moment metadata
    DB-->>UI: Realtime Moment publication
    UI-->>Creator: Show published Moment
```

## Champion Flow

```mermaid
sequenceDiagram
    actor Fan
    participant UI as Next.js Frontend
    participant API as API Routes
    participant DB as Supabase
    Fan->>UI: Champion a Moment
    UI->>UI: Apply optimistic state
    UI->>API: PUT Champion endorsement
    API->>DB: Enforce one endorsement per account
    DB-->>API: Updated Champion count
    API-->>UI: Authoritative result
    DB-->>UI: Realtime update for connected clients
    UI-->>Fan: Display confirmed Champion state
```

## Related documentation

- [Architecture](Architecture.md)
- [API](API.md)
- [TxLINE](TxLINE.md)
- [Database](Database.md)
