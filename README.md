# Momento

Momento transforms official football events into shared social experiences. Fans follow TxLINE-powered match data, publish short reaction videos, **Champion** community Moments for free, and **Support** the Moments they believe will define a live match through Solana Devnet transactions.

Built for the TxLINE Consumer & Fan Experiences Hackathon with Next.js, Supabase, TxLINE, and Solana.

## Quick links

- [Live deployment](https://themomento.xyz)
- [Complete documentation](docs/README.md)
- [Architecture](docs/Architecture.md) · [renderable diagram](docs/ARCHITECTURE_DIAGRAM.md)
- [API](docs/API.md) · [TxLINE integration](docs/TxLINE.md) · [Database](docs/Database.md)
- [Demo guide](docs/Demo.md) · [Deployment guide](docs/Deployment.md)
- [GitHub repository](https://github.com/WorldsBestSoftwareDeveloper/momento)

## Judge walkthrough

```text
/matches/france-spain-demo?mode=replay
/matches/france-spain-demo?mode=live
```

Replay Mode is deterministic and wallet-free. Live Mode progressively unlocks official events, enables realtime community activity, and supports explicit Solana Devnet transactions.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

PowerShell users can replace the copy command with `Copy-Item .env.example .env.local`. Open [http://localhost:3000](http://localhost:3000), and see the [setup guide](docs/README.md#setup) for service configuration and validation.

---

Momento turns official football data into community conviction—and a transparent path to the defining Moment of every match.
