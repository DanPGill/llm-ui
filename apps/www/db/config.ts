import { column, defineDb, defineTable } from "astro:db";

const WaitingList = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    email: column.text({ unique: true }),
  },
});

const ChatRequest = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    systemContent: column.text({ unique: false }),
    userContent: column.text({ unique: false }),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { WaitingList, ChatRequest },
});
