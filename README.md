# tic-tac-toe

In-browser real-time tic-tac-toe game

# Work Log

- 6/17: 3pm-4pm - planning
- 6/18: 10am-11:30am - project setup & first req: https://tic-tac-fg0mwzkny-acamann.vercel.app/
- 6/18: 2pm-3pm - connect to supabase, generate pairing code
- 6/18: 9:30pm-10:30pm - enter username, join with code
- 6/20: 9:30pm-10:30pm - prop up express api (revisit later)
- 6/22: 8am-9am - subscribe to channel w game changes
- 6/23: 6:30am-7:30am - win logic, show result
- 6/25: 10am-11:30am - supabase authentication
- 6/25: 2pm-4pm - display leaderboard, component clean up
- 6/25: 9pm-10pm - final touches, scheduled DB clean up

# Goals

- [x] User can create a new game board
- [x] Allow two (and only two) players to connect to a game board
- [x] Persist game state on the server in a database of your choice
- [x] Follow standard rules for tic-tac-toe (or noughts and crosses)
- [x] Display the game result and persist in the database at the end of the game
- [x] Display a ranking of the top five players and allow players to start a new game

# Game Plan

1.  [x] design DB models, rough UI
    - PairingCodes: code, player_id, creation_date
    - Game: game_id, player_1, player_2, board, outcome?, start_date, end_date
    - Leaderboard: player_id, wins, losses, draws
2.  [x] project set up
    - static client site - vite with vanilla react app, typescript
    - connect directly to supabase db
    - persist current game_id, player_id in local storage
3.  [x] v0.1 - deploy empty game board
4.  [x] v0.2 - two player connection
    - first player creates game
    - ABCD game code generaged
    - first player polls db for player 2 join
    - second player joins, enters code
    - game code removed from db
5.  [x] v0.3 - full game rules & persist state
6.  [x] v0.4 - game result
7.  [x] v0.5 - leader board
8.  [ ] v0.6 - both players can continue playing without re-pairing
9.  [ ] v0.7 - make it look pleasant
    - wargames theme

# Future work:

- [x] player auth
- [x] stop polling
- [x] clean up old access codes, unfinished games in db
- [ ] allow playing new game without re-pairing
- [ ] add winning percentage to leader board
- [ ] different game modes
  - numerical 1-9 odd vs even, first to sum 3 in a row to 15
  - tabletop
- [ ] cheat code / super user override
- [ ] share game code button with direct link
