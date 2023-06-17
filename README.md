# tic-tac-toe
In-browser real-time tic-tac-toe game

# Requirements
 - User can create a new game board
 - Allow two (and only two) players to connect to a game board
 - Persist game state on the server in a database of your choice
 - Follow standard rules for tic-tac-toe (or noughts and crosses)
 - Display the game result and persist in the database at the end of the game
 - Display a ranking of the top five players and allow players to start a new game

# Game Plan
 1. design DB models, rough UI
   - AccessCodes: code, game_id, request_date (added when first player creates game, removed when paired or expired)
   - Game: game_id, player_1, player_2, board, outcome?, start_date, end_date
   - Leaderboard: player_id, wins, losses, draws
 2. project set up 
   - static client site, connect to supabase (investigate further)
   - persist current game_id, player_id in local storage
 3. v0.1 - deploy empty game board
 4. v0.2 - two player connection
   - first player creates game
   - ABCD game code generaged
   - first player polls db for player 2 join
   - second player joins, enters code
   - game code removed from db
 5. v0.3 - full game rules & persist state
 6. v0.4 - game result
 7. v0.5 - leader board
 8. v0.6 - both players can continue playing
 8. v0.7 - make it look pleasant
   - wargames theme

# Future work:
 - clean up old access codes, unfinished games in db
 - stop polling
 - add winning percentage to leader board
 - persist player name in local storage
 - share game code button with direct link
 - different game modes 
   - numerical 1-9 odd vs even, first to sum 3 in a row to 15
   - tabletop
 - cheat code / super user override
 - player auth

