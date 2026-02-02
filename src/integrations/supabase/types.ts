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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      collection_products: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          position: number | null
          product_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          position?: number | null
          product_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          position?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          handle: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          published_at: string | null
          sort_order: string | null
          store_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          handle?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          sort_order?: string | null
          store_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          handle?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          sort_order?: string | null
          store_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          applies_to: string | null
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean | null
          maximum_uses: number | null
          minimum_purchase: number | null
          once_per_customer: boolean | null
          product_ids: string[] | null
          starts_at: string | null
          store_id: string
          title: string | null
          updated_at: string
          used_count: number | null
        }
        Insert: {
          applies_to?: string | null
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_uses?: number | null
          minimum_purchase?: number | null
          once_per_customer?: boolean | null
          product_ids?: string[] | null
          starts_at?: string | null
          store_id: string
          title?: string | null
          updated_at?: string
          used_count?: number | null
        }
        Update: {
          applies_to?: string | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_uses?: number | null
          minimum_purchase?: number | null
          once_per_customer?: boolean | null
          product_ids?: string[] | null
          starts_at?: string | null
          store_id?: string
          title?: string | null
          updated_at?: string
          used_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          address1: string | null
          address2: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          name: string
          phone: string | null
          province: string | null
          store_id: string
          updated_at: string
          zip: string | null
        }
        Insert: {
          address1?: string | null
          address2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name: string
          phone?: string | null
          province?: string | null
          store_id: string
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address1?: string | null
          address2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name?: string
          phone?: string | null
          province?: string | null
          store_id?: string
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_locations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          owner_id: string
          pi_txid: string | null
          processed_at: string | null
          requested_at: string
          status: string
          store_id: string
          updated_at: string
          wallet_address: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          owner_id: string
          pi_txid?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
          store_id: string
          updated_at?: string
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          owner_id?: string
          pi_txid?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
          store_id?: string
          updated_at?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_payouts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_sales: {
        Row: {
          amount: number
          created_at: string
          id: string
          net_amount: number
          order_id: string
          owner_id: string
          payout_id: string | null
          payout_status: string
          pi_txid: string | null
          platform_fee: number
          store_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          net_amount?: number
          order_id: string
          owner_id: string
          payout_id?: string | null
          payout_status?: string
          pi_txid?: string | null
          platform_fee?: number
          store_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          net_amount?: number
          order_id?: string
          owner_id?: string
          payout_id?: string | null
          payout_status?: string
          pi_txid?: string | null
          platform_fee?: number
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_sales_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_sales_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "merchant_payouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          fulfillment_status: string | null
          id: string
          order_id: string
          price: number
          product_id: string | null
          properties: Json | null
          quantity: number
          requires_shipping: boolean | null
          sku: string | null
          taxable: boolean | null
          title: string
          total_discount: number | null
          variant_id: string | null
          variant_title: string | null
        }
        Insert: {
          created_at?: string
          fulfillment_status?: string | null
          id?: string
          order_id: string
          price?: number
          product_id?: string | null
          properties?: Json | null
          quantity?: number
          requires_shipping?: boolean | null
          sku?: string | null
          taxable?: boolean | null
          title: string
          total_discount?: number | null
          variant_id?: string | null
          variant_title?: string | null
        }
        Update: {
          created_at?: string
          fulfillment_status?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          properties?: Json | null
          quantity?: number
          requires_shipping?: boolean | null
          sku?: string | null
          taxable?: boolean | null
          title?: string
          total_discount?: number | null
          variant_id?: string | null
          variant_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          delivery_email_sent: boolean | null
          download_count: number | null
          download_expires_at: string | null
          id: string
          items: Json
          notes: string | null
          payout_status: string | null
          payout_txid: string | null
          pi_payment_id: string | null
          pi_txid: string | null
          shipping_address: string | null
          status: string
          store_id: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          delivery_email_sent?: boolean | null
          download_count?: number | null
          download_expires_at?: string | null
          id?: string
          items?: Json
          notes?: string | null
          payout_status?: string | null
          payout_txid?: string | null
          pi_payment_id?: string | null
          pi_txid?: string | null
          shipping_address?: string | null
          status?: string
          store_id: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          delivery_email_sent?: boolean | null
          download_count?: number | null
          download_expires_at?: string | null
          id?: string
          items?: Json
          notes?: string | null
          payout_status?: string | null
          payout_txid?: string | null
          pi_payment_id?: string | null
          pi_txid?: string | null
          shipping_address?: string | null
          status?: string
          store_id?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      pi_users: {
        Row: {
          created_at: string
          id: string
          pi_uid: string
          pi_username: string | null
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          pi_uid: string
          pi_username?: string | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          pi_uid?: string
          pi_username?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      price_rules: {
        Row: {
          allocation_method: string | null
          created_at: string
          customer_selection: string | null
          ends_at: string | null
          entitled_product_ids: string[] | null
          id: string
          is_active: boolean | null
          once_per_customer: boolean | null
          prerequisite_product_ids: string[] | null
          prerequisite_quantity_min: number | null
          prerequisite_subtotal_min: number | null
          starts_at: string | null
          store_id: string
          target_selection: string | null
          target_type: string
          title: string
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
          value: number
          value_type: string
        }
        Insert: {
          allocation_method?: string | null
          created_at?: string
          customer_selection?: string | null
          ends_at?: string | null
          entitled_product_ids?: string[] | null
          id?: string
          is_active?: boolean | null
          once_per_customer?: boolean | null
          prerequisite_product_ids?: string[] | null
          prerequisite_quantity_min?: number | null
          prerequisite_subtotal_min?: number | null
          starts_at?: string | null
          store_id: string
          target_selection?: string | null
          target_type?: string
          title: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          value?: number
          value_type?: string
        }
        Update: {
          allocation_method?: string | null
          created_at?: string
          customer_selection?: string | null
          ends_at?: string | null
          entitled_product_ids?: string[] | null
          id?: string
          is_active?: boolean | null
          once_per_customer?: boolean | null
          prerequisite_product_ids?: string[] | null
          prerequisite_quantity_min?: number | null
          prerequisite_subtotal_min?: number | null
          starts_at?: string | null
          store_id?: string
          target_selection?: string | null
          target_type?: string
          title?: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          value?: number
          value_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_rules_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number | null
          product_id: string
          values: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position?: number | null
          product_id: string
          values?: string[]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number | null
          product_id?: string
          values?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          content: string | null
          created_at: string
          customer_email: string
          customer_name: string
          helpful_count: number | null
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          store_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          store_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          store_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          barcode: string | null
          compare_at_price: number | null
          created_at: string
          id: string
          image_url: string | null
          inventory_policy: string | null
          inventory_quantity: number | null
          is_active: boolean | null
          option1: string | null
          option2: string | null
          option3: string | null
          position: number | null
          price: number
          product_id: string
          requires_shipping: boolean | null
          sku: string | null
          title: string
          updated_at: string
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          barcode?: string | null
          compare_at_price?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          inventory_policy?: string | null
          inventory_quantity?: number | null
          is_active?: boolean | null
          option1?: string | null
          option2?: string | null
          option3?: string | null
          position?: number | null
          price?: number
          product_id: string
          requires_shipping?: boolean | null
          sku?: string | null
          title: string
          updated_at?: string
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          barcode?: string | null
          compare_at_price?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          inventory_policy?: string | null
          inventory_quantity?: number | null
          is_active?: boolean | null
          option1?: string | null
          option2?: string | null
          option3?: string | null
          position?: number | null
          price?: number
          product_id?: string
          requires_shipping?: boolean | null
          sku?: string | null
          title?: string
          updated_at?: string
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          digital_file_url: string | null
          download_count: number | null
          download_limit: number | null
          id: string
          images: string[] | null
          inventory_count: number | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price: number
          product_type: string | null
          requires_shipping: boolean | null
          seo_description: string | null
          seo_title: string | null
          sort_order: number | null
          store_id: string
          tags: string[] | null
          updated_at: string
          vendor: string | null
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          category?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          digital_file_url?: string | null
          download_count?: number | null
          download_limit?: number | null
          id?: string
          images?: string[] | null
          inventory_count?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price?: number
          product_type?: string | null
          requires_shipping?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          sort_order?: number | null
          store_id: string
          tags?: string[] | null
          updated_at?: string
          vendor?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          category?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          digital_file_url?: string | null
          download_count?: number | null
          download_limit?: number | null
          id?: string
          images?: string[] | null
          inventory_count?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price?: number
          product_type?: string | null
          requires_shipping?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          sort_order?: number | null
          store_id?: string
          tags?: string[] | null
          updated_at?: string
          vendor?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipping_rates: {
        Row: {
          created_at: string
          delivery_days_max: number | null
          delivery_days_min: number | null
          id: string
          is_active: boolean | null
          max_order_amount: number | null
          max_weight: number | null
          min_order_amount: number | null
          min_weight: number | null
          name: string
          price: number
          weight_unit: string | null
          zone_id: string
        }
        Insert: {
          created_at?: string
          delivery_days_max?: number | null
          delivery_days_min?: number | null
          id?: string
          is_active?: boolean | null
          max_order_amount?: number | null
          max_weight?: number | null
          min_order_amount?: number | null
          min_weight?: number | null
          name: string
          price?: number
          weight_unit?: string | null
          zone_id: string
        }
        Update: {
          created_at?: string
          delivery_days_max?: number | null
          delivery_days_min?: number | null
          id?: string
          is_active?: boolean | null
          max_order_amount?: number | null
          max_weight?: number | null
          min_order_amount?: number | null
          min_weight?: number | null
          name?: string
          price?: number
          weight_unit?: string | null
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_rates_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "shipping_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          countries: string[] | null
          created_at: string
          id: string
          name: string
          store_id: string
          updated_at: string
        }
        Insert: {
          countries?: string[] | null
          created_at?: string
          id?: string
          name: string
          store_id: string
          updated_at?: string
        }
        Update: {
          countries?: string[] | null
          created_at?: string
          id?: string
          name?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_zones_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_analytics: {
        Row: {
          add_to_carts: number | null
          average_order_value: number | null
          checkouts_completed: number | null
          checkouts_initiated: number | null
          conversion_rate: number | null
          created_at: string
          date: string
          id: string
          orders_count: number | null
          page_views: number | null
          store_id: string
          top_products: Json | null
          total_sales: number | null
          traffic_sources: Json | null
          unique_visitors: number | null
        }
        Insert: {
          add_to_carts?: number | null
          average_order_value?: number | null
          checkouts_completed?: number | null
          checkouts_initiated?: number | null
          conversion_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          orders_count?: number | null
          page_views?: number | null
          store_id: string
          top_products?: Json | null
          total_sales?: number | null
          traffic_sources?: Json | null
          unique_visitors?: number | null
        }
        Update: {
          add_to_carts?: number | null
          average_order_value?: number | null
          checkouts_completed?: number | null
          checkouts_initiated?: number | null
          conversion_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          orders_count?: number | null
          page_views?: number | null
          store_id?: string
          top_products?: Json | null
          total_sales?: number | null
          traffic_sources?: Json | null
          unique_visitors?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "store_analytics_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_banners: {
        Row: {
          button_text: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          link: string | null
          position: number | null
          store_id: string
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          link?: string | null
          position?: number | null
          store_id: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          link?: string | null
          position?: number | null
          store_id?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_banners_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_customers: {
        Row: {
          accepts_marketing: boolean | null
          addresses: Json | null
          created_at: string
          default_address: Json | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          note: string | null
          orders_count: number | null
          phone: string | null
          store_id: string
          tags: string[] | null
          total_spent: number | null
          updated_at: string
          verified_email: boolean | null
        }
        Insert: {
          accepts_marketing?: boolean | null
          addresses?: Json | null
          created_at?: string
          default_address?: Json | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          note?: string | null
          orders_count?: number | null
          phone?: string | null
          store_id: string
          tags?: string[] | null
          total_spent?: number | null
          updated_at?: string
          verified_email?: boolean | null
        }
        Update: {
          accepts_marketing?: boolean | null
          addresses?: Json | null
          created_at?: string
          default_address?: Json | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          note?: string | null
          orders_count?: number | null
          phone?: string | null
          store_id?: string
          tags?: string[] | null
          total_spent?: number | null
          updated_at?: string
          verified_email?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "store_customers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_navigation: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean | null
          link: string
          parent_id: string | null
          position: number | null
          store_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean | null
          link: string
          parent_id?: string | null
          position?: number | null
          store_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean | null
          link?: string
          parent_id?: string | null
          position?: number | null
          store_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_navigation_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "store_navigation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_navigation_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_pages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          slug: string
          store_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          slug: string
          store_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string
          store_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_pages_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          about_page: string | null
          address: string | null
          announcement_bar_text_color: string | null
          announcement_link: string | null
          announcement_text: string | null
          banner_url: string | null
          body_text_color: string | null
          contact_email: string | null
          contact_page: string | null
          contact_phone: string | null
          created_at: string
          currency: string | null
          description: string | null
          enable_compare: boolean | null
          enable_wishlist: boolean | null
          featured_collection_id: string | null
          font_body: string | null
          font_heading: string | null
          footer_style: string | null
          header_style: string | null
          heading_text_color: string | null
          hero_button_link: string | null
          hero_button_text: string | null
          hero_subtitle: string | null
          hero_subtitle_text_color: string | null
          hero_title: string | null
          hero_title_text_color: string | null
          id: string
          is_published: boolean | null
          layout_style: string | null
          logo_url: string | null
          name: string
          owner_id: string
          payout_wallet: string | null
          primary_color: string | null
          privacy_policy: string | null
          products_per_page: number | null
          refund_policy: string | null
          secondary_color: string | null
          shipping_policy: string | null
          show_announcement_bar: boolean | null
          show_featured_collection: boolean | null
          show_product_reviews: boolean | null
          show_sold_count: boolean | null
          show_stock_count: boolean | null
          slug: string
          social_facebook: string | null
          social_instagram: string | null
          social_tiktok: string | null
          social_twitter: string | null
          store_type: string | null
          template_id: string | null
          terms_of_service: string | null
          updated_at: string
        }
        Insert: {
          about_page?: string | null
          address?: string | null
          announcement_bar_text_color?: string | null
          announcement_link?: string | null
          announcement_text?: string | null
          banner_url?: string | null
          body_text_color?: string | null
          contact_email?: string | null
          contact_page?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          enable_compare?: boolean | null
          enable_wishlist?: boolean | null
          featured_collection_id?: string | null
          font_body?: string | null
          font_heading?: string | null
          footer_style?: string | null
          header_style?: string | null
          heading_text_color?: string | null
          hero_button_link?: string | null
          hero_button_text?: string | null
          hero_subtitle?: string | null
          hero_subtitle_text_color?: string | null
          hero_title?: string | null
          hero_title_text_color?: string | null
          id?: string
          is_published?: boolean | null
          layout_style?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          payout_wallet?: string | null
          primary_color?: string | null
          privacy_policy?: string | null
          products_per_page?: number | null
          refund_policy?: string | null
          secondary_color?: string | null
          shipping_policy?: string | null
          show_announcement_bar?: boolean | null
          show_featured_collection?: boolean | null
          show_product_reviews?: boolean | null
          show_sold_count?: boolean | null
          show_stock_count?: boolean | null
          slug: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          store_type?: string | null
          template_id?: string | null
          terms_of_service?: string | null
          updated_at?: string
        }
        Update: {
          about_page?: string | null
          address?: string | null
          announcement_bar_text_color?: string | null
          announcement_link?: string | null
          announcement_text?: string | null
          banner_url?: string | null
          body_text_color?: string | null
          contact_email?: string | null
          contact_page?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          enable_compare?: boolean | null
          enable_wishlist?: boolean | null
          featured_collection_id?: string | null
          font_body?: string | null
          font_heading?: string | null
          footer_style?: string | null
          header_style?: string | null
          heading_text_color?: string | null
          hero_button_link?: string | null
          hero_button_text?: string | null
          hero_subtitle?: string | null
          hero_subtitle_text_color?: string | null
          hero_title?: string | null
          hero_title_text_color?: string | null
          id?: string
          is_published?: boolean | null
          layout_style?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          payout_wallet?: string | null
          primary_color?: string | null
          privacy_policy?: string | null
          products_per_page?: number | null
          refund_policy?: string | null
          secondary_color?: string | null
          shipping_policy?: string | null
          show_announcement_bar?: boolean | null
          show_featured_collection?: boolean | null
          show_product_reviews?: boolean | null
          show_sold_count?: boolean | null
          show_stock_count?: boolean | null
          slug?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          store_type?: string | null
          template_id?: string | null
          terms_of_service?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          expires_at: string
          id: string
          pi_payment_id: string | null
          pi_transaction_id: string | null
          plan_type: string
          started_at: string
          status: string
          store_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          expires_at: string
          id?: string
          pi_payment_id?: string | null
          pi_transaction_id?: string | null
          plan_type: string
          started_at?: string
          status?: string
          store_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          pi_payment_id?: string | null
          pi_transaction_id?: string | null
          plan_type?: string
          started_at?: string
          status?: string
          store_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          customer_email: string
          id: string
          product_id: string
          store_id: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          id?: string
          product_id: string
          store_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          id?: string
          product_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
