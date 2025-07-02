export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      live_events: {
        Row: {
          created_at: string
          event_type: string
          game: string
          id: string
          payload: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          game: string
          id?: string
          payload?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          game?: string
          id?: string
          payload?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_events_game_fkey"
            columns: ["game"]
            isOneToOne: false
            referencedRelation: "live_games"
            referencedColumns: ["id"]
          },
        ]
      }
      live_games: {
        Row: {
          contents: Json
          created_at: string
          host: string
          id: string
          last_updated: string
        }
        Insert: {
          contents: Json
          created_at?: string
          host?: string
          id?: string
          last_updated?: string
        }
        Update: {
          contents?: Json
          created_at?: string
          host?: string
          id?: string
          last_updated?: string
        }
        Relationships: []
      }
      live_rooms: {
        Row: {
          code: string
          id: string
        }
        Insert: {
          code: string
          id: string
        }
        Update: {
          code?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_rooms_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "live_games"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          display_name: string | null
          id: string
          last_updated: string
          username: string
        }
        Insert: {
          display_name?: string | null
          id: string
          last_updated?: string
          username: string
        }
        Update: {
          display_name?: string | null
          id?: string
          last_updated?: string
          username?: string
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          author: string | null
          contents: Json | null
          copy_protect: boolean
          created_at: string
          id: number
          interactions: number
          last_updated: string
          last_used: string
          likes: number
          quiz_description: string
          thumbnail: Json | null
          title: string
          visibility: Database["public"]["Enums"]["visibility"]
        }
        Insert: {
          author?: string | null
          contents?: Json | null
          copy_protect?: boolean
          created_at?: string
          id?: number
          interactions?: number
          last_updated?: string
          last_used?: string
          likes?: number
          quiz_description?: string
          thumbnail?: Json | null
          title?: string
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Update: {
          author?: string | null
          contents?: Json | null
          copy_protect?: boolean
          created_at?: string
          id?: number
          interactions?: number
          last_updated?: string
          last_used?: string
          likes?: number
          quiz_description?: string
          thumbnail?: Json | null
          title?: string
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_quiz: {
        Args: {
          loq_id: number
        }
        Returns: undefined
      }
      generate_username_from_email: {
        Args: {
          email: string
        }
        Returns: string
      }
      get_user_info: {
        Args: {
          user_id: string
        }
        Returns: Json
      }
      live_create_room: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      live_generate_room_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      live_get_room_id: {
        Args: {
          room_code: string
        }
        Returns: string
      }
      live_join_room: {
        Args: {
          display_name: string
          room_id: string
        }
        Returns: Json
      }
      update_username: {
        Args: {
          new_username: string
        }
        Returns: undefined
      }
      upload_loq: {
        Args: {
          loq_id: number
          loq_contents: Json
        }
        Returns: number
      }
      username_exists: {
        Args: {
          username_new: string
        }
        Returns: boolean
      }
      username_is_invalid: {
        Args: {
          username_new: string
        }
        Returns: boolean
      }
    }
    Enums: {
      visibility: "public" | "unlisted" | "private"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

