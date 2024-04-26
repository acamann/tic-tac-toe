// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RoomEntity } from "../types/models";
import Ably from "ably";

// Define a service using a base URL and expected endpoints
export const roomsApi = createApi({
  reducerPath: "roomsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/rooms/" }),
  endpoints: (builder) => ({
    getRooms: builder.query<RoomEntity[], void>({
      query: () => "",
      transformResponse: (response: { rooms: RoomEntity[] }) => response.rooms,
      async onCacheEntryAdded(
        _,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        // connect for realtime updates when the cache subscription starts
        const realtimeClient = new Ably.Realtime({
          authUrl: "/api/realtime/token",
        });
        const channel = realtimeClient.channels.get("Lobby");

        try {
          // wait for the initial query to resolve before proceeding
          await cacheDataLoaded;

          // when data is received from the server,
          // update our room data accordingly
          channel.subscribe((message) => {
            if (message.name === "create") {
              const room = JSON.parse(message.data) as RoomEntity;
              updateCachedData((cache) => {
                cache.push(room);
              });
            } else if (message.name === "update") {
              const updatedRoom = JSON.parse(message.data) as RoomEntity;
              updateCachedData((cache) => {
                const index = cache.findIndex((r) => r.id === updatedRoom.id);
                if (index >= 0) {
                  cache[index] = updatedRoom;
                }
              });
            } else if (message.name === "delete") {
              const deletedRoom = JSON.parse(message.data) as RoomEntity;
              updateCachedData((cache) => {
                const index = cache.findIndex((r) => r.id === deletedRoom.id);
                if (index >= 0) {
                  cache.splice(index, 1);
                }
              });
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
    createRoom: builder.mutation<void, void>({
      query: () => ({
        url: "",
        method: "POST",
      }),
    }),
    joinRoom: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "PUT",
      }),
    }),
    leaveRoom: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useJoinRoomMutation,
  useLeaveRoomMutation,
} = roomsApi;
