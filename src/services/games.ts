// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Game, GameEntity, MoveRequest } from "../types/models";
import Ably from "ably";

const transformGameEntity = (entity: GameEntity): Game => ({
  ...entity,
  current_turn:
    entity.current_turn === true ? 1 : entity.current_turn === false ? 0 : null,
});

// Define a service using a base URL and expected endpoints
export const gamesApi = createApi({
  reducerPath: "gamesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/games/" }),
  endpoints: (builder) => ({
    getGames: builder.query<Game[], void>({
      query: () => "",
      transformResponse: (response: { games: GameEntity[] }) =>
        response.games.map(transformGameEntity),
    }),
    getGame: builder.query<Game, string>({
      query: (id) => `/${id}`,
      transformResponse: (entity: GameEntity) => transformGameEntity(entity),
      async onCacheEntryAdded(
        gameId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        // connect for realtime updates when the cache subscription starts
        const realtimeClient = new Ably.Realtime({
          authUrl: "/api/realtime/token",
        });
        const channel = realtimeClient.channels.get(gameId);

        try {
          // wait for the initial query to resolve before proceeding
          await cacheDataLoaded;

          // when data is received from the server,
          // update our room data accordingly
          channel.subscribe((message) => {
            if (message.name === "game") {
              const game = transformGameEntity(
                JSON.parse(message.data) as GameEntity,
              );
              updateCachedData((cache) => {
                Object.assign(cache, game);
              });
            } else {
              console.error(["Unknown message", message]);
            }
          });
        } catch {
          // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
          // in which case `cacheDataLoaded` will throw
        }
        // cacheEntryRemoved will resolve when the cache subscription is no longer active
        await cacheEntryRemoved;

        // perform cleanup steps once the `cacheEntryRemoved` promise resolves
        channel.unsubscribe();
        channel.detach(); // need to detach to release channel, unsubscribe doesn't cut it
        realtimeClient.close();
      },
    }),
    startGame: builder.mutation<{ game_id: string }, { room_id: string }>({
      query: (body) => ({
        url: "/",
        method: "PUT",
        body: JSON.stringify(body),
      }),
    }),
    takeTurn: builder.mutation<void, { gameId: string; body: MoveRequest }>({
      query: (args) => ({
        url: `/${args.gameId}/moves`,
        method: "PUT",
        body: args.body,
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetGamesQuery,
  useGetGameQuery,
  useLazyGetGameQuery,
  useStartGameMutation,
  useTakeTurnMutation,
} = gamesApi;
