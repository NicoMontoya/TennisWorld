# TennisWorld Database Models

This directory contains the Mongoose models for the TennisWorld application. These models define the structure of the MongoDB collections and provide methods for interacting with the data.

## Core Models

### Player
Represents a tennis player with detailed biographical information, career statistics, and playing style.

### Tournament
Represents a tennis tournament with venue details, prize money, points structure, and historical champions.

### Match
Represents a tennis match with detailed statistics, score breakdown, and momentum tracking.

### PlayerRanking
Represents the current ranking of a player with race rankings and points breakdown.

### HeadToHead
Represents the head-to-head record between two players with detailed statistics by surface and tournament category.

## Advanced Models

### TournamentDraw
Represents the draw structure of a tournament with seeded players, qualifiers, and match progression.

### PlayerStats
Represents detailed player statistics by surface, tournament level, and time period.

### PlayerForm
Tracks a player's recent form, momentum, and performance indicators.

### MatchPrediction
System-generated predictions for match outcomes with probability analysis.

### User
Enhanced user model with preferences, activity tracking, and social features.

### UserPrediction
User-generated predictions for match outcomes with confidence levels and points.

### PredictionLeaderboard
Leaderboards for prediction accuracy across users by tournament, season, or all-time.

### PlayerRankingHistory
Historical ranking data for players with tournament points changes.

### PlayerInjury
Tracks player injuries, recovery timeline, and impact on rankings.

## Database Migration

The database has been enhanced with these models to provide a more comprehensive tennis data platform. To migrate your existing data to the new schema, run:

```bash
cd backend
node src/utils/runDatabaseMigration.js
```

This will:
1. Update existing models with enhanced schemas
2. Create new collections for the advanced models
3. Migrate existing data to the new schema structure
4. Set up proper indexes for optimal query performance

## Schema Relationships

The models are designed with the following relationships:

- **Player** → **PlayerRanking** (one-to-many)
- **Player** → **PlayerRankingHistory** (one-to-many)
- **Player** → **PlayerStats** (one-to-many)
- **Player** → **PlayerForm** (one-to-one)
- **Player** → **PlayerInjury** (one-to-many)
- **Tournament** → **Match** (one-to-many)
- **Tournament** → **TournamentDraw** (one-to-many)
- **Player** ↔ **Player** → **HeadToHead** (many-to-many)
- **Match** → **MatchPrediction** (one-to-many)
- **User** → **UserPrediction** (one-to-many)
- **Tournament** → **PredictionLeaderboard** (one-to-one)

## Indexing Strategy

Each model includes carefully designed indexes to optimize query performance:

- **Unique Indexes**: For primary keys and compound unique constraints
- **Compound Indexes**: For common query patterns involving multiple fields
- **Text Indexes**: For text search capabilities
- **Single-Field Indexes**: For frequently filtered fields

## Virtual Properties

Many models include virtual properties that provide derived data without storing it in the database:

- Calculated statistics
- Related entity references
- Formatted data for display

## Model Methods

Each model includes static and instance methods for common operations:

- Data retrieval with filtering and sorting
- Statistical calculations
- Data updates with validation
- Relationship management

## Pre/Post Hooks

Mongoose middleware hooks are used for:

- Data validation
- Automatic field updates
- Derived field calculations
- Cross-collection consistency

## Usage Examples

See the controller files in `src/controllers` for examples of how to use these models in your application.
