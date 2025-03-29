import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';
import PlayerRanking from '../models/PlayerRanking.js';
import HeadToHead from '../models/HeadToHead.js';

dotenv.config();

// Function to write data to a file
const writeToFile = (data, filename) => {
  const filePath = path.join(process.cwd(), filename);
  fs.writeFileSync(filePath, data);
  console.log(`Data exported to ${filePath}`);
};

// Function to escape string values for SQL
const escapeSQL = (value) => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value instanceof Date) return `'${value.toISOString().replace(/T/, ' ').replace(/\..+/, '')}'`;
  
  // Handle strings
  return `'${String(value).replace(/'/g, "''")}'`;
};

// Function to generate SQL CREATE TABLE statements
const generateCreateTableStatements = () => {
  let sql = '';
  
  // Players table
  sql += `-- Players table\n`;
  sql += `CREATE TABLE players (\n`;
  sql += `  id INT PRIMARY KEY AUTO_INCREMENT,\n`;
  sql += `  player_id INT NOT NULL UNIQUE,\n`;
  sql += `  player_name VARCHAR(255) NOT NULL,\n`;
  sql += `  country VARCHAR(100) NOT NULL,\n`;
  sql += `  type ENUM('ATP', 'WTA') NOT NULL,\n`;
  sql += `  rank INT NOT NULL,\n`;
  sql += `  points INT NOT NULL,\n`;
  sql += `  movement INT DEFAULT 0,\n`;
  sql += `  last_updated DATETIME,\n`;
  sql += `  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;
  
  // Tournaments table
  sql += `-- Tournaments table\n`;
  sql += `CREATE TABLE tournaments (\n`;
  sql += `  id INT PRIMARY KEY AUTO_INCREMENT,\n`;
  sql += `  tournament_id INT NOT NULL UNIQUE,\n`;
  sql += `  name VARCHAR(255) NOT NULL,\n`;
  sql += `  location VARCHAR(255) NOT NULL,\n`;
  sql += `  surface VARCHAR(100) NOT NULL,\n`;
  sql += `  category VARCHAR(100) NOT NULL,\n`;
  sql += `  prize_money VARCHAR(255) NOT NULL,\n`;
  sql += `  start_date DATE NOT NULL,\n`;
  sql += `  end_date DATE NOT NULL,\n`;
  sql += `  status ENUM('Upcoming', 'Ongoing', 'Completed') NOT NULL,\n`;
  sql += `  last_updated DATETIME,\n`;
  sql += `  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;
  
  // Matches table
  sql += `-- Matches table\n`;
  sql += `CREATE TABLE matches (\n`;
  sql += `  id INT PRIMARY KEY AUTO_INCREMENT,\n`;
  sql += `  match_id INT NOT NULL UNIQUE,\n`;
  sql += `  tournament_id INT NOT NULL,\n`;
  sql += `  round VARCHAR(100) NOT NULL,\n`;
  sql += `  player1_id INT NOT NULL,\n`;
  sql += `  player2_id INT NOT NULL,\n`;
  sql += `  winner_id INT,\n`;
  sql += `  score VARCHAR(255),\n`;
  sql += `  match_date DATETIME NOT NULL,\n`;
  sql += `  status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') NOT NULL,\n`;
  sql += `  court VARCHAR(100),\n`;
  sql += `  duration INT,\n`;
  sql += `  last_updated DATETIME,\n`;
  sql += `  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n`;
  sql += `  FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id),\n`;
  sql += `  FOREIGN KEY (player1_id) REFERENCES players(player_id),\n`;
  sql += `  FOREIGN KEY (player2_id) REFERENCES players(player_id),\n`;
  sql += `  FOREIGN KEY (winner_id) REFERENCES players(player_id)\n`;
  sql += `);\n\n`;
  
  // Match Stats table
  sql += `-- Match Stats table\n`;
  sql += `CREATE TABLE match_stats (\n`;
  sql += `  id INT PRIMARY KEY AUTO_INCREMENT,\n`;
  sql += `  match_id INT NOT NULL,\n`;
  sql += `  player_id INT NOT NULL,\n`;
  sql += `  aces INT,\n`;
  sql += `  double_faults INT,\n`;
  sql += `  first_serve_percentage INT,\n`;
  sql += `  first_serve_points_won INT,\n`;
  sql += `  second_serve_points_won INT,\n`;
  sql += `  break_points_saved INT,\n`;
  sql += `  break_points_faced INT,\n`;
  sql += `  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n`;
  sql += `  FOREIGN KEY (match_id) REFERENCES matches(match_id),\n`;
  sql += `  FOREIGN KEY (player_id) REFERENCES players(player_id),\n`;
  sql += `  UNIQUE KEY (match_id, player_id)\n`;
  sql += `);\n\n`;
  
  // Player Rankings table
  sql += `-- Player Rankings table\n`;
  sql += `CREATE TABLE player_rankings (\n`;
  sql += `  id INT PRIMARY KEY AUTO_INCREMENT,\n`;
  sql += `  player_id INT NOT NULL,\n`;
  sql += `  type ENUM('ATP', 'WTA') NOT NULL,\n`;
  sql += `  rank INT NOT NULL,\n`;
  sql += `  points INT NOT NULL,\n`;
  sql += `  ranking_date DATE NOT NULL,\n`;
  sql += `  movement INT DEFAULT 0,\n`;
  sql += `  week_number INT NOT NULL,\n`;
  sql += `  year INT NOT NULL,\n`;
  sql += `  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n`;
  sql += `  FOREIGN KEY (player_id) REFERENCES players(player_id),\n`;
  sql += `  UNIQUE KEY (player_id, type, ranking_date)\n`;
  sql += `);\n\n`;
  
  // Head to Head table
  sql += `-- Head to Head table\n`;
  sql += `CREATE TABLE head_to_head (\n`;
  sql += `  id INT PRIMARY KEY AUTO_INCREMENT,\n`;
  sql += `  player1_id INT NOT NULL,\n`;
  sql += `  player2_id INT NOT NULL,\n`;
  sql += `  matches_count INT NOT NULL DEFAULT 0,\n`;
  sql += `  player1_wins INT NOT NULL DEFAULT 0,\n`;
  sql += `  player2_wins INT NOT NULL DEFAULT 0,\n`;
  sql += `  last_match_date DATETIME,\n`;
  sql += `  last_match_id INT,\n`;
  sql += `  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n`;
  sql += `  FOREIGN KEY (player1_id) REFERENCES players(player_id),\n`;
  sql += `  FOREIGN KEY (player2_id) REFERENCES players(player_id),\n`;
  sql += `  FOREIGN KEY (last_match_id) REFERENCES matches(match_id),\n`;
  sql += `  UNIQUE KEY (player1_id, player2_id)\n`;
  sql += `);\n\n`;
  
  // Surface Stats table
  sql += `-- Surface Stats table\n`;
  sql += `CREATE TABLE surface_stats (\n`;
  sql += `  id INT PRIMARY KEY AUTO_INCREMENT,\n`;
  sql += `  head_to_head_id INT NOT NULL,\n`;
  sql += `  surface ENUM('hard', 'clay', 'grass', 'indoor') NOT NULL,\n`;
  sql += `  matches INT NOT NULL DEFAULT 0,\n`;
  sql += `  player1_wins INT NOT NULL DEFAULT 0,\n`;
  sql += `  player2_wins INT NOT NULL DEFAULT 0,\n`;
  sql += `  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n`;
  sql += `  FOREIGN KEY (head_to_head_id) REFERENCES head_to_head(id),\n`;
  sql += `  UNIQUE KEY (head_to_head_id, surface)\n`;
  sql += `);\n\n`;
  
  // Tournament Category Stats table
  sql += `-- Tournament Category Stats table\n`;
  sql += `CREATE TABLE tournament_category_stats (\n`;
  sql += `  id INT PRIMARY KEY AUTO_INCREMENT,\n`;
  sql += `  head_to_head_id INT NOT NULL,\n`;
  sql += `  category ENUM('grand_slam', 'masters_1000', 'atp_500', 'atp_250', 'other') NOT NULL,\n`;
  sql += `  matches INT NOT NULL DEFAULT 0,\n`;
  sql += `  player1_wins INT NOT NULL DEFAULT 0,\n`;
  sql += `  player2_wins INT NOT NULL DEFAULT 0,\n`;
  sql += `  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n`;
  sql += `  FOREIGN KEY (head_to_head_id) REFERENCES head_to_head(id),\n`;
  sql += `  UNIQUE KEY (head_to_head_id, category)\n`;
  sql += `);\n\n`;
  
  return sql;
};

// Function to generate INSERT statements for players
const generatePlayerInserts = async () => {
  const players = await Player.find().lean();
  let sql = '-- Player INSERT statements\n';
  
  for (const player of players) {
    sql += `INSERT INTO players (player_id, player_name, country, type, rank, points, movement, last_updated) VALUES (`;
    sql += `${escapeSQL(player.player_id)}, `;
    sql += `${escapeSQL(player.player_name)}, `;
    sql += `${escapeSQL(player.country)}, `;
    sql += `${escapeSQL(player.type)}, `;
    sql += `${escapeSQL(player.rank)}, `;
    sql += `${escapeSQL(player.points)}, `;
    sql += `${escapeSQL(player.movement)}, `;
    sql += `${escapeSQL(player.lastUpdated)}`;
    sql += `);\n`;
  }
  
  return sql;
};

// Function to generate INSERT statements for tournaments
const generateTournamentInserts = async () => {
  const tournaments = await Tournament.find().lean();
  let sql = '\n-- Tournament INSERT statements\n';
  
  for (const tournament of tournaments) {
    sql += `INSERT INTO tournaments (tournament_id, name, location, surface, category, prize_money, start_date, end_date, status, last_updated) VALUES (`;
    sql += `${escapeSQL(tournament.tournament_id)}, `;
    sql += `${escapeSQL(tournament.name)}, `;
    sql += `${escapeSQL(tournament.location)}, `;
    sql += `${escapeSQL(tournament.surface)}, `;
    sql += `${escapeSQL(tournament.category)}, `;
    sql += `${escapeSQL(tournament.prize_money)}, `;
    sql += `${escapeSQL(tournament.start_date)}, `;
    sql += `${escapeSQL(tournament.end_date)}, `;
    sql += `${escapeSQL(tournament.status)}, `;
    sql += `${escapeSQL(tournament.lastUpdated)}`;
    sql += `);\n`;
  }
  
  return sql;
};

// Function to generate INSERT statements for matches
const generateMatchInserts = async () => {
  const matches = await Match.find().lean();
  let sql = '\n-- Match INSERT statements\n';
  
  for (const match of matches) {
    sql += `INSERT INTO matches (match_id, tournament_id, round, player1_id, player2_id, winner_id, score, match_date, status, court, duration, last_updated) VALUES (`;
    sql += `${escapeSQL(match.match_id)}, `;
    sql += `${escapeSQL(match.tournament_id)}, `;
    sql += `${escapeSQL(match.round)}, `;
    sql += `${escapeSQL(match.player1_id)}, `;
    sql += `${escapeSQL(match.player2_id)}, `;
    sql += `${escapeSQL(match.winner_id)}, `;
    sql += `${escapeSQL(match.score)}, `;
    sql += `${escapeSQL(match.match_date)}, `;
    sql += `${escapeSQL(match.status)}, `;
    sql += `${escapeSQL(match.court)}, `;
    sql += `${escapeSQL(match.duration)}, `;
    sql += `${escapeSQL(match.lastUpdated)}`;
    sql += `);\n`;
    
    // Generate match stats inserts if stats exist
    if (match.stats && Object.keys(match.stats).length > 0) {
      // Player 1 stats
      if (match.stats.player1_aces !== undefined || 
          match.stats.player1_double_faults !== undefined || 
          match.stats.player1_first_serve_percentage !== undefined) {
        sql += `INSERT INTO match_stats (match_id, player_id, aces, double_faults, first_serve_percentage) VALUES (`;
        sql += `${escapeSQL(match.match_id)}, `;
        sql += `${escapeSQL(match.player1_id)}, `;
        sql += `${escapeSQL(match.stats.player1_aces || null)}, `;
        sql += `${escapeSQL(match.stats.player1_double_faults || null)}, `;
        sql += `${escapeSQL(match.stats.player1_first_serve_percentage || null)}`;
        sql += `);\n`;
      }
      
      // Player 2 stats
      if (match.stats.player2_aces !== undefined || 
          match.stats.player2_double_faults !== undefined || 
          match.stats.player2_first_serve_percentage !== undefined) {
        sql += `INSERT INTO match_stats (match_id, player_id, aces, double_faults, first_serve_percentage) VALUES (`;
        sql += `${escapeSQL(match.match_id)}, `;
        sql += `${escapeSQL(match.player2_id)}, `;
        sql += `${escapeSQL(match.stats.player2_aces || null)}, `;
        sql += `${escapeSQL(match.stats.player2_double_faults || null)}, `;
        sql += `${escapeSQL(match.stats.player2_first_serve_percentage || null)}`;
        sql += `);\n`;
      }
    }
  }
  
  return sql;
};

// Function to generate INSERT statements for player rankings
const generatePlayerRankingInserts = async () => {
  const rankings = await PlayerRanking.find().lean();
  let sql = '\n-- Player Ranking INSERT statements\n';
  
  for (const ranking of rankings) {
    sql += `INSERT INTO player_rankings (player_id, type, rank, points, ranking_date, movement, week_number, year) VALUES (`;
    sql += `${escapeSQL(ranking.player_id)}, `;
    sql += `${escapeSQL(ranking.type)}, `;
    sql += `${escapeSQL(ranking.rank)}, `;
    sql += `${escapeSQL(ranking.points)}, `;
    sql += `${escapeSQL(ranking.ranking_date)}, `;
    sql += `${escapeSQL(ranking.movement)}, `;
    sql += `${escapeSQL(ranking.week_number)}, `;
    sql += `${escapeSQL(ranking.year)}`;
    sql += `);\n`;
  }
  
  return sql;
};

// Function to generate INSERT statements for head to head
const generateHeadToHeadInserts = async () => {
  const headToHeads = await HeadToHead.find().lean();
  let sql = '\n-- Head to Head INSERT statements\n';
  let surfaceStatsSql = '\n-- Surface Stats INSERT statements\n';
  let categorySql = '\n-- Tournament Category Stats INSERT statements\n';
  
  for (const [index, h2h] of headToHeads.entries()) {
    sql += `INSERT INTO head_to_head (player1_id, player2_id, matches_count, player1_wins, player2_wins, last_match_date, last_match_id) VALUES (`;
    sql += `${escapeSQL(h2h.player1_id)}, `;
    sql += `${escapeSQL(h2h.player2_id)}, `;
    sql += `${escapeSQL(h2h.matches_count)}, `;
    sql += `${escapeSQL(h2h.player1_wins)}, `;
    sql += `${escapeSQL(h2h.player2_wins)}, `;
    sql += `${escapeSQL(h2h.last_match_date)}, `;
    sql += `${escapeSQL(h2h.last_match_id)}`;
    sql += `);\n`;
    
    // Generate surface stats inserts
    if (h2h.surface_stats) {
      for (const surface of Object.keys(h2h.surface_stats)) {
        const stats = h2h.surface_stats[surface];
        if (stats && stats.matches > 0) {
          surfaceStatsSql += `INSERT INTO surface_stats (head_to_head_id, surface, matches, player1_wins, player2_wins) VALUES (`;
          surfaceStatsSql += `${index + 1}, `; // Using index+1 as the head_to_head_id
          surfaceStatsSql += `${escapeSQL(surface)}, `;
          surfaceStatsSql += `${escapeSQL(stats.matches)}, `;
          surfaceStatsSql += `${escapeSQL(stats.player1_wins)}, `;
          surfaceStatsSql += `${escapeSQL(stats.player2_wins)}`;
          surfaceStatsSql += `);\n`;
        }
      }
    }
    
    // Generate tournament category stats inserts
    if (h2h.tournament_category_stats) {
      for (const category of Object.keys(h2h.tournament_category_stats)) {
        const stats = h2h.tournament_category_stats[category];
        if (stats && stats.matches > 0) {
          categorySql += `INSERT INTO tournament_category_stats (head_to_head_id, category, matches, player1_wins, player2_wins) VALUES (`;
          categorySql += `${index + 1}, `; // Using index+1 as the head_to_head_id
          categorySql += `${escapeSQL(category)}, `;
          categorySql += `${escapeSQL(stats.matches)}, `;
          categorySql += `${escapeSQL(stats.player1_wins)}, `;
          categorySql += `${escapeSQL(stats.player2_wins)}`;
          categorySql += `);\n`;
        }
      }
    }
  }
  
  return sql + surfaceStatsSql + categorySql;
};

const exportToSQL = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    
    console.log('Generating SQL schema and data...');
    
    // Generate CREATE TABLE statements
    const createTablesSql = generateCreateTableStatements();
    
    // Generate INSERT statements
    const playerInsertsSql = await generatePlayerInserts();
    const tournamentInsertsSql = await generateTournamentInserts();
    const matchInsertsSql = await generateMatchInserts();
    const playerRankingInsertsSql = await generatePlayerRankingInserts();
    const headToHeadInsertsSql = await generateHeadToHeadInserts();
    
    // Combine all SQL
    const fullSql = `-- Tennis World SQL Schema and Data\n\n` +
                   createTablesSql +
                   playerInsertsSql +
                   tournamentInsertsSql +
                   matchInsertsSql +
                   playerRankingInsertsSql +
                   headToHeadInsertsSql;
    
    // Write to file
    writeToFile(fullSql, 'tennis_world.sql');
    
    console.log('SQL export completed successfully');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error exporting to SQL:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error Code:', error.code);
    }
    
    process.exit(1);
  }
};

// Run the export function
exportToSQL();
