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
1. design DB models, API routes, rough UI
2. project set up 
3. v0.1 - deploy empty game board
4. v0.2 - two player connection
  - 1st player creates game, autogenerates ABCD game code, 2nd player joins with code
5. v0.3 - full game rules & persist state
6. v0.4 - game result
7. v0.5 - leader board
8. v0.6 - make it look pleasant
  - wargames theme

# Future work:
 - share game code button with direct link
 - different game modes 
   - numerical 1-9 odd vs even, first to sum 3 in a row to 15
   - tabletop
 - cheat code / super user override
 - add winning percentage to leader board

