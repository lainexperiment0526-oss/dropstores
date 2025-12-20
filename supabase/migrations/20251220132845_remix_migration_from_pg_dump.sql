CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: collection_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collection_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    collection_id uuid NOT NULL,
    product_id uuid NOT NULL,
    "position" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    image_url text,
    handle text,
    sort_order text DEFAULT 'manual'::text,
    is_published boolean DEFAULT true,
    published_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: discount_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discount_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    code text NOT NULL,
    title text,
    description text,
    discount_type text DEFAULT 'percentage'::text NOT NULL,
    discount_value numeric DEFAULT 0 NOT NULL,
    minimum_purchase numeric DEFAULT 0,
    maximum_uses integer,
    used_count integer DEFAULT 0,
    once_per_customer boolean DEFAULT false,
    applies_to text DEFAULT 'all'::text,
    product_ids uuid[] DEFAULT '{}'::uuid[],
    starts_at timestamp with time zone DEFAULT now(),
    ends_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: inventory_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    name text NOT NULL,
    address1 text,
    address2 text,
    city text,
    province text,
    country text,
    zip text,
    phone text,
    is_active boolean DEFAULT true,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid,
    variant_id uuid,
    title text NOT NULL,
    variant_title text,
    sku text,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric DEFAULT 0 NOT NULL,
    total_discount numeric DEFAULT 0,
    fulfillment_status text DEFAULT 'unfulfilled'::text,
    requires_shipping boolean DEFAULT true,
    taxable boolean DEFAULT true,
    properties jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text,
    shipping_address text,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    pi_payment_id text,
    pi_txid text,
    payout_status text DEFAULT 'pending'::text,
    payout_txid text,
    download_count integer DEFAULT 0,
    download_expires_at timestamp with time zone,
    delivery_email_sent boolean DEFAULT false
);


--
-- Name: pi_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pi_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    pi_uid text NOT NULL,
    pi_username text,
    wallet_address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: price_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    title text NOT NULL,
    target_type text DEFAULT 'line_item'::text NOT NULL,
    target_selection text DEFAULT 'all'::text,
    allocation_method text DEFAULT 'across'::text,
    value_type text DEFAULT 'percentage'::text NOT NULL,
    value numeric DEFAULT 0 NOT NULL,
    once_per_customer boolean DEFAULT false,
    customer_selection text DEFAULT 'all'::text,
    prerequisite_subtotal_min numeric,
    prerequisite_quantity_min integer,
    prerequisite_product_ids uuid[] DEFAULT '{}'::uuid[],
    entitled_product_ids uuid[] DEFAULT '{}'::uuid[],
    usage_limit integer,
    usage_count integer DEFAULT 0,
    starts_at timestamp with time zone DEFAULT now(),
    ends_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: product_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    name text NOT NULL,
    "position" integer DEFAULT 0,
    "values" text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    title text NOT NULL,
    sku text,
    barcode text,
    price numeric DEFAULT 0 NOT NULL,
    compare_at_price numeric,
    inventory_quantity integer DEFAULT 0,
    inventory_policy text DEFAULT 'deny'::text,
    weight numeric,
    weight_unit text DEFAULT 'kg'::text,
    requires_shipping boolean DEFAULT true,
    is_active boolean DEFAULT true,
    "position" integer DEFAULT 0,
    option1 text,
    option2 text,
    option3 text,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    compare_at_price numeric(10,2),
    images text[] DEFAULT '{}'::text[],
    category text,
    inventory_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    product_type text DEFAULT 'physical'::text,
    digital_file_url text,
    download_limit integer DEFAULT 3,
    download_count integer DEFAULT 0
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: shipping_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_rates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    zone_id uuid NOT NULL,
    name text NOT NULL,
    price numeric DEFAULT 0 NOT NULL,
    min_order_amount numeric,
    max_order_amount numeric,
    min_weight numeric,
    max_weight numeric,
    weight_unit text DEFAULT 'kg'::text,
    delivery_days_min integer,
    delivery_days_max integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: shipping_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_zones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    name text NOT NULL,
    countries text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: store_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    page_views integer DEFAULT 0,
    unique_visitors integer DEFAULT 0,
    add_to_carts integer DEFAULT 0,
    checkouts_initiated integer DEFAULT 0,
    checkouts_completed integer DEFAULT 0,
    orders_count integer DEFAULT 0,
    total_sales numeric DEFAULT 0,
    average_order_value numeric DEFAULT 0,
    conversion_rate numeric DEFAULT 0,
    top_products jsonb DEFAULT '[]'::jsonb,
    traffic_sources jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: store_customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid NOT NULL,
    email text NOT NULL,
    first_name text,
    last_name text,
    phone text,
    accepts_marketing boolean DEFAULT false,
    orders_count integer DEFAULT 0,
    total_spent numeric DEFAULT 0,
    tags text[] DEFAULT '{}'::text[],
    note text,
    verified_email boolean DEFAULT false,
    default_address jsonb,
    addresses jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: stores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    logo_url text,
    banner_url text,
    primary_color text DEFAULT '#0EA5E9'::text,
    secondary_color text DEFAULT '#38BDF8'::text,
    contact_email text,
    contact_phone text,
    address text,
    is_published boolean DEFAULT false,
    template_id text DEFAULT 'modern'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    payout_wallet text,
    store_type text DEFAULT 'online'::text
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    store_id uuid,
    plan_type text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    pi_payment_id text,
    pi_transaction_id text,
    amount numeric DEFAULT 0 NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT subscriptions_plan_type_check CHECK ((plan_type = ANY (ARRAY['monthly'::text, 'yearly'::text]))),
    CONSTRAINT subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'cancelled'::text, 'pending'::text])))
);


--
-- Name: collection_products collection_products_collection_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection_products
    ADD CONSTRAINT collection_products_collection_id_product_id_key UNIQUE (collection_id, product_id);


--
-- Name: collection_products collection_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection_products
    ADD CONSTRAINT collection_products_pkey PRIMARY KEY (id);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: discount_codes discount_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_pkey PRIMARY KEY (id);


--
-- Name: discount_codes discount_codes_store_id_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_store_id_code_key UNIQUE (store_id, code);


--
-- Name: inventory_locations inventory_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_locations
    ADD CONSTRAINT inventory_locations_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: pi_users pi_users_pi_uid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pi_users
    ADD CONSTRAINT pi_users_pi_uid_key UNIQUE (pi_uid);


--
-- Name: pi_users pi_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pi_users
    ADD CONSTRAINT pi_users_pkey PRIMARY KEY (id);


--
-- Name: price_rules price_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_rules
    ADD CONSTRAINT price_rules_pkey PRIMARY KEY (id);


--
-- Name: product_options product_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_options
    ADD CONSTRAINT product_options_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: shipping_rates shipping_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_pkey PRIMARY KEY (id);


--
-- Name: shipping_zones shipping_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_pkey PRIMARY KEY (id);


--
-- Name: store_analytics store_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_analytics
    ADD CONSTRAINT store_analytics_pkey PRIMARY KEY (id);


--
-- Name: store_analytics store_analytics_store_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_analytics
    ADD CONSTRAINT store_analytics_store_id_date_key UNIQUE (store_id, date);


--
-- Name: store_customers store_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_customers
    ADD CONSTRAINT store_customers_pkey PRIMARY KEY (id);


--
-- Name: store_customers store_customers_store_id_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_customers
    ADD CONSTRAINT store_customers_store_id_email_key UNIQUE (store_id, email);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: stores stores_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_slug_key UNIQUE (slug);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: collections update_collections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: discount_codes update_discount_codes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON public.discount_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: inventory_locations update_inventory_locations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_inventory_locations_updated_at BEFORE UPDATE ON public.inventory_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: pi_users update_pi_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_pi_users_updated_at BEFORE UPDATE ON public.pi_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: price_rules update_price_rules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_price_rules_updated_at BEFORE UPDATE ON public.price_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: product_variants update_product_variants_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shipping_zones update_shipping_zones_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_shipping_zones_updated_at BEFORE UPDATE ON public.shipping_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: store_customers update_store_customers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_store_customers_updated_at BEFORE UPDATE ON public.store_customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: stores update_stores_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscriptions update_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: collection_products collection_products_collection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection_products
    ADD CONSTRAINT collection_products_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE;


--
-- Name: collection_products collection_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection_products
    ADD CONSTRAINT collection_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: collections collections_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: discount_codes discount_codes_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: inventory_locations inventory_locations_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_locations
    ADD CONSTRAINT inventory_locations_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: order_items order_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;


--
-- Name: orders orders_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: price_rules price_rules_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_rules
    ADD CONSTRAINT price_rules_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: product_options product_options_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_options
    ADD CONSTRAINT product_options_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: shipping_rates shipping_rates_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.shipping_zones(id) ON DELETE CASCADE;


--
-- Name: shipping_zones shipping_zones_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: store_analytics store_analytics_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_analytics
    ADD CONSTRAINT store_analytics_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: store_customers store_customers_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_customers
    ADD CONSTRAINT store_customers_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: stores stores_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: discount_codes Active discount codes are viewable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Active discount codes are viewable" ON public.discount_codes FOR SELECT USING (((is_active = true) AND ((starts_at IS NULL) OR (starts_at <= now())) AND ((ends_at IS NULL) OR (ends_at > now()))));


--
-- Name: products Active products in published stores are viewable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Active products in published stores are viewable" ON public.products FOR SELECT USING (((is_active = true) AND (EXISTS ( SELECT 1
   FROM public.stores
  WHERE ((stores.id = products.store_id) AND (stores.is_published = true))))));


--
-- Name: product_variants Active variants in published stores are viewable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Active variants in published stores are viewable" ON public.product_variants FOR SELECT USING (((is_active = true) AND (EXISTS ( SELECT 1
   FROM (public.products p
     JOIN public.stores s ON ((s.id = p.store_id)))
  WHERE ((p.id = product_variants.product_id) AND (p.is_active = true) AND (s.is_published = true))))));


--
-- Name: orders Anyone can create orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);


--
-- Name: collection_products Collection products are viewable for published collections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Collection products are viewable for published collections" ON public.collection_products FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.collections
  WHERE ((collections.id = collection_products.collection_id) AND (collections.is_published = true)))));


--
-- Name: product_options Options viewable for published products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Options viewable for published products" ON public.product_options FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.products p
     JOIN public.stores s ON ((s.id = p.store_id)))
  WHERE ((p.id = product_options.product_id) AND (p.is_active = true) AND (s.is_published = true)))));


--
-- Name: order_items Order items can be created with orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Order items can be created with orders" ON public.order_items FOR INSERT WITH CHECK (true);


--
-- Name: collections Published collections are viewable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Published collections are viewable" ON public.collections FOR SELECT USING ((is_published = true));


--
-- Name: stores Published stores are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Published stores are viewable by everyone" ON public.stores FOR SELECT USING ((is_published = true));


--
-- Name: shipping_rates Shipping rates viewable for published stores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Shipping rates viewable for published stores" ON public.shipping_rates FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.shipping_zones sz
     JOIN public.stores s ON ((s.id = sz.store_id)))
  WHERE ((sz.id = shipping_rates.zone_id) AND (s.is_published = true)))));


--
-- Name: store_analytics Store owners can insert analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can insert analytics" ON public.store_analytics FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.stores
  WHERE ((stores.id = store_analytics.store_id) AND (stores.owner_id = auth.uid())))));


--
-- Name: collection_products Store owners can manage collection products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage collection products" ON public.collection_products USING ((EXISTS ( SELECT 1
   FROM (public.collections c
     JOIN public.stores s ON ((s.id = c.store_id)))
  WHERE ((c.id = collection_products.collection_id) AND (s.owner_id = auth.uid())))));


--
-- Name: collections Store owners can manage collections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage collections" ON public.collections USING ((EXISTS ( SELECT 1
   FROM public.stores
  WHERE ((stores.id = collections.store_id) AND (stores.owner_id = auth.uid())))));


--
-- Name: inventory_locations Store owners can manage inventory locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage inventory locations" ON public.inventory_locations USING ((EXISTS ( SELECT 1
   FROM public.stores
  WHERE ((stores.id = inventory_locations.store_id) AND (stores.owner_id = auth.uid())))));


--
-- Name: product_options Store owners can manage product options; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage product options" ON public.product_options USING ((EXISTS ( SELECT 1
   FROM (public.products p
     JOIN public.stores s ON ((s.id = p.store_id)))
  WHERE ((p.id = product_options.product_id) AND (s.owner_id = auth.uid())))));


--
-- Name: shipping_rates Store owners can manage shipping rates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage shipping rates" ON public.shipping_rates USING ((EXISTS ( SELECT 1
   FROM (public.shipping_zones sz
     JOIN public.stores s ON ((s.id = sz.store_id)))
  WHERE ((sz.id = shipping_rates.zone_id) AND (s.owner_id = auth.uid())))));


--
-- Name: shipping_zones Store owners can manage shipping zones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage shipping zones" ON public.shipping_zones USING ((EXISTS ( SELECT 1
   FROM public.stores
  WHERE ((stores.id = shipping_zones.store_id) AND (stores.owner_id = auth.uid())))));


--
-- Name: store_customers Store owners can manage their customers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage their customers" ON public.store_customers USING ((EXISTS ( SELECT 1
   FROM public.stores
  WHERE ((stores.id = store_customers.store_id) AND (stores.owner_id = auth.uid())))));


--
-- Name: discount_codes Store owners can manage their discount codes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage their discount codes" ON public.discount_codes USING ((EXISTS ( SELECT 1
   FROM public.stores
  WHERE ((stores.id = discount_codes.store_id) AND (stores.owner_id = auth.uid())))));


--
-- Name: price_rules Store owners can manage their price rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage their price rules" ON public.price_rules USING ((EXISTS ( SELECT 1
   FROM public.stores
  WHERE ((stores.id = price_rules.store_id) AND (stores.owner_id = auth.uid())))));


--
-- Name: product_variants Store owners can manage their product variants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage their product variants" ON public.product_variants USING ((EXISTS ( SELECT 1
   FROM (public.products p
     JOIN public.stores s ON ((s.id = p.store_id)))
  WHERE ((p.id = product_variants.product_id) AND (s.owner_id = auth.uid())))));


--
-- Name: products Store owners can manage their products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage their products" ON public.products USING ((EXISTS ( SELECT 1
   FROM public.stores
  WHERE ((stores.id = products.store_id) AND (stores.owner_id = auth.uid())))));


--
-- Name: stores Store owners can manage their stores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage their stores" ON public.stores USING ((auth.uid() = owner_id));


--
-- Name: orders Store owners can update their orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can update their orders" ON public.orders FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.stores
  WHERE ((stores.id = orders.store_id) AND (stores.owner_id = auth.uid())))));


--
-- Name: order_items Store owners can view order items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can view order items" ON public.order_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.orders o
     JOIN public.stores s ON ((s.id = o.store_id)))
  WHERE ((o.id = order_items.order_id) AND (s.owner_id = auth.uid())))));


--
-- Name: store_analytics Store owners can view their analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can view their analytics" ON public.store_analytics FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.stores
  WHERE ((stores.id = store_analytics.store_id) AND (stores.owner_id = auth.uid())))));


--
-- Name: orders Store owners can view their orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can view their orders" ON public.orders FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.stores
  WHERE ((stores.id = orders.store_id) AND (stores.owner_id = auth.uid())))));


--
-- Name: pi_users Users can create their own pi user data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own pi user data" ON public.pi_users FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: subscriptions Users can create their own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: pi_users Users can update their own pi user data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own pi user data" ON public.pi_users FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: subscriptions Users can update their own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: pi_users Users can view their own pi user data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own pi user data" ON public.pi_users FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: subscriptions Users can view their own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: collection_products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

--
-- Name: collections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

--
-- Name: discount_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: inventory_locations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;

--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: pi_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pi_users ENABLE ROW LEVEL SECURITY;

--
-- Name: price_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.price_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: product_options; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;

--
-- Name: product_variants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: shipping_rates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

--
-- Name: shipping_zones; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

--
-- Name: store_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.store_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: store_customers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.store_customers ENABLE ROW LEVEL SECURITY;

--
-- Name: stores; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;