export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cash_cuts: {
        Row: {
          cashier_id: string
          closed_at: string
          counted_cash: number
          created_at: string
          denominations: Json | null
          difference: number
          id: string
          invoice_count: number
          notes: string | null
          opened_at: string | null
          system_card: number
          system_cash: number
          system_total: number
        }
        Insert: {
          cashier_id: string
          closed_at?: string
          counted_cash?: number
          created_at?: string
          denominations?: Json | null
          difference?: number
          id?: string
          invoice_count?: number
          notes?: string | null
          opened_at?: string | null
          system_card?: number
          system_cash?: number
          system_total?: number
        }
        Update: {
          cashier_id?: string
          closed_at?: string
          counted_cash?: number
          created_at?: string
          denominations?: Json | null
          difference?: number
          id?: string
          invoice_count?: number
          notes?: string | null
          opened_at?: string | null
          system_card?: number
          system_cash?: number
          system_total?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      comprobantes_electronicos: {
        Row: {
          clave_numerica: string | null
          consecutivo: string
          created_at: string
          created_by: string | null
          descuento_total: number
          estado: string
          fecha_emision: string
          gti_respuesta: Json | null
          hacienda_mensaje: string | null
          id: string
          impuesto_total: number
          intentos: number
          moneda: string
          numero_factura_interno: string
          payload_solicitud: Json | null
          pdf_url: string | null
          proximo_intento_at: string | null
          receptor_correo: string | null
          receptor_identificacion: string | null
          receptor_nombre: string | null
          receptor_tipo_id: string | null
          subtotal: number
          tipo_cambio: number | null
          tipo_comprobante: string
          total: number
          ultimo_intento_at: string | null
          updated_at: string
          xml_firmado: string | null
        }
        Insert: {
          clave_numerica?: string | null
          consecutivo: string
          created_at?: string
          created_by?: string | null
          descuento_total?: number
          estado?: string
          fecha_emision?: string
          gti_respuesta?: Json | null
          hacienda_mensaje?: string | null
          id?: string
          impuesto_total?: number
          intentos?: number
          moneda?: string
          numero_factura_interno: string
          payload_solicitud?: Json | null
          pdf_url?: string | null
          proximo_intento_at?: string | null
          receptor_correo?: string | null
          receptor_identificacion?: string | null
          receptor_nombre?: string | null
          receptor_tipo_id?: string | null
          subtotal?: number
          tipo_cambio?: number | null
          tipo_comprobante: string
          total?: number
          ultimo_intento_at?: string | null
          updated_at?: string
          xml_firmado?: string | null
        }
        Update: {
          clave_numerica?: string | null
          consecutivo?: string
          created_at?: string
          created_by?: string | null
          descuento_total?: number
          estado?: string
          fecha_emision?: string
          gti_respuesta?: Json | null
          hacienda_mensaje?: string | null
          id?: string
          impuesto_total?: number
          intentos?: number
          moneda?: string
          numero_factura_interno?: string
          payload_solicitud?: Json | null
          pdf_url?: string | null
          proximo_intento_at?: string | null
          receptor_correo?: string | null
          receptor_identificacion?: string | null
          receptor_nombre?: string | null
          receptor_tipo_id?: string | null
          subtotal?: number
          tipo_cambio?: number | null
          tipo_comprobante?: string
          total?: number
          ultimo_intento_at?: string | null
          updated_at?: string
          xml_firmado?: string | null
        }
        Relationships: []
      }
      comprobantes_logs: {
        Row: {
          accion: string
          comprobante_id: string | null
          created_at: string
          estado_resultado: string | null
          http_status: number | null
          id: string
          mensaje: string | null
          request_payload: Json | null
          response_payload: Json | null
        }
        Insert: {
          accion: string
          comprobante_id?: string | null
          created_at?: string
          estado_resultado?: string | null
          http_status?: number | null
          id?: string
          mensaje?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
        }
        Update: {
          accion?: string
          comprobante_id?: string | null
          created_at?: string
          estado_resultado?: string | null
          http_status?: number | null
          id?: string
          mensaje?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "comprobantes_logs_comprobante_id_fkey"
            columns: ["comprobante_id"]
            isOneToOne: false
            referencedRelation: "comprobantes_electronicos"
            referencedColumns: ["id"]
          },
        ]
      }
      emisor_config: {
        Row: {
          actividad_economica: string
          activo: boolean
          ambiente: string
          barrio: string | null
          canton: string
          cedula_numero: string
          cedula_tipo: string
          certificado_cargado: boolean
          consecutivo_factura: number
          consecutivo_nota_credito: number
          consecutivo_tiquete: number
          correo_electronico: string
          created_at: string
          distrito: string
          gti_api_url: string | null
          gti_usuario: string | null
          id: string
          nombre_comercial: string | null
          otras_senas: string | null
          provincia: string
          razon_social: string
          sucursal: string
          telefono: string | null
          telefono_codigo_pais: string | null
          terminal: string
          updated_at: string
        }
        Insert: {
          actividad_economica: string
          activo?: boolean
          ambiente?: string
          barrio?: string | null
          canton: string
          cedula_numero: string
          cedula_tipo?: string
          certificado_cargado?: boolean
          consecutivo_factura?: number
          consecutivo_nota_credito?: number
          consecutivo_tiquete?: number
          correo_electronico: string
          created_at?: string
          distrito: string
          gti_api_url?: string | null
          gti_usuario?: string | null
          id?: string
          nombre_comercial?: string | null
          otras_senas?: string | null
          provincia: string
          razon_social: string
          sucursal?: string
          telefono?: string | null
          telefono_codigo_pais?: string | null
          terminal?: string
          updated_at?: string
        }
        Update: {
          actividad_economica?: string
          activo?: boolean
          ambiente?: string
          barrio?: string | null
          canton?: string
          cedula_numero?: string
          cedula_tipo?: string
          certificado_cargado?: boolean
          consecutivo_factura?: number
          consecutivo_nota_credito?: number
          consecutivo_tiquete?: number
          correo_electronico?: string
          created_at?: string
          distrito?: string
          gti_api_url?: string | null
          gti_usuario?: string | null
          id?: string
          nombre_comercial?: string | null
          otras_senas?: string | null
          provincia?: string
          razon_social?: string
          sucursal?: string
          telefono?: string | null
          telefono_codigo_pais?: string | null
          terminal?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          id: string
          movement_type: string
          new_stock: number | null
          notes: string | null
          previous_stock: number | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          movement_type: string
          new_stock?: number | null
          notes?: string | null
          previous_stock?: number | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          movement_type?: string
          new_stock?: number | null
          notes?: string | null
          previous_stock?: number | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          discount: number
          id: string
          invoice_id: string
          line_total: number
          product_code: string | null
          product_id: string | null
          product_name: string
          quantity: number
          tax_amount: number
          tax_rate: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          discount?: number
          id?: string
          invoice_id: string
          line_total: number
          product_code?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          tax_amount?: number
          tax_rate?: number
          unit?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string
          discount?: number
          id?: string
          invoice_id?: string
          line_total?: number
          product_code?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          tax_amount?: number
          tax_rate?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          cashier_id: string
          created_at: string
          customer_email: string | null
          customer_id_number: string | null
          customer_name: string | null
          discount_total: number
          id: string
          invoice_number: string
          notes: string | null
          payment_method: string
          status: string
          subtotal: number
          tax_total: number
          total: number
          updated_at: string
        }
        Insert: {
          cashier_id: string
          created_at?: string
          customer_email?: string | null
          customer_id_number?: string | null
          customer_name?: string | null
          discount_total?: number
          id?: string
          invoice_number?: string
          notes?: string | null
          payment_method?: string
          status?: string
          subtotal?: number
          tax_total?: number
          total?: number
          updated_at?: string
        }
        Update: {
          cashier_id?: string
          created_at?: string
          customer_email?: string | null
          customer_id_number?: string | null
          customer_name?: string | null
          discount_total?: number
          id?: string
          invoice_number?: string
          notes?: string | null
          payment_method?: string
          status?: string
          subtotal?: number
          tax_total?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_details: {
        Row: {
          amount: number
          change: number | null
          created_at: string
          id: string
          invoice_id: string
          method: string
          received: number | null
          reference: string | null
        }
        Insert: {
          amount: number
          change?: number | null
          created_at?: string
          id?: string
          invoice_id: string
          method: string
          received?: number | null
          reference?: string | null
        }
        Update: {
          amount?: number
          change?: number | null
          created_at?: string
          id?: string
          invoice_id?: string
          method?: string
          received?: number | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_details_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category: string | null
          category_id: string | null
          code: string
          cost: number | null
          created_at: string
          description: string | null
          id: string
          min_stock: number
          name: string
          price: number
          stock: number
          tax_rate: number
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          category_id?: string | null
          code: string
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          min_stock?: number
          name: string
          price: number
          stock?: number
          tax_rate?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          category_id?: string | null
          code?: string
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          min_stock?: number
          name?: string
          price?: number
          stock?: number
          tax_rate?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "cashier"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "cashier"],
    },
  },
} as const
