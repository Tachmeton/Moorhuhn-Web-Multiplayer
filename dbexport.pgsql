--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.12
-- Dumped by pg_dump version 9.6.12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: game; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game (
    id integer NOT NULL,
    shots integer,
    hits integer,
    date date DEFAULT ('now'::text)::date NOT NULL,
    duration integer
);


ALTER TABLE public.game OWNER TO postgres;

--
-- Name: game_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.game_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.game_id_seq OWNER TO postgres;

--
-- Name: game_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.game_id_seq OWNED BY public.game.id;


--
-- Name: player; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player (
    id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying,
    salt character varying,
    chickenpoints integer DEFAULT 0,
    shooterpoints integer DEFAULT 0
);


ALTER TABLE public.player OWNER TO postgres;

--
-- Name: player_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.player_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.player_id_seq OWNER TO postgres;

--
-- Name: player_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.player_id_seq OWNED BY public.player.id;


--
-- Name: player_in_gane; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_in_gane (
    game integer NOT NULL,
    shooter integer NOT NULL,
    chicken1 integer,
    chicken2 integer,
    chicken3 integer,
    chicken4 integer,
    chicken5 integer,
    chicken6 integer,
    chicken7 integer
);


ALTER TABLE public.player_in_gane OWNER TO postgres;

--
-- Name: game id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game ALTER COLUMN id SET DEFAULT nextval('public.game_id_seq'::regclass);


--
-- Name: player id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player ALTER COLUMN id SET DEFAULT nextval('public.player_id_seq'::regclass);


--
-- Data for Name: game; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game (id, shots, hits, date, duration) FROM stdin;
\.


--
-- Name: game_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.game_id_seq', 1, false);


--
-- Data for Name: player; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.player (id, name, email, password, salt, chickenpoints, shooterpoints) FROM stdin;
1	Frranz	franz@admin.de	$2b$14$NuagtPOdwmszXQP9DTMnuux/CGYmjtckz3w3PCUjT4pWAcW3xfv5i	$2b$14$NuagtPOdwmszXQP9DTMnuu	0	0
\.


--
-- Name: player_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.player_id_seq', 1, true);


--
-- Data for Name: player_in_gane; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.player_in_gane (game, shooter, chicken1, chicken2, chicken3, chicken4, chicken5, chicken6, chicken7) FROM stdin;
\.


--
-- Name: game game_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game
    ADD CONSTRAINT game_pkey PRIMARY KEY (id);


--
-- Name: player_in_gane player_in_gane_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_in_gane
    ADD CONSTRAINT player_in_gane_pkey PRIMARY KEY (game, shooter);


--
-- Name: player player_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT player_pkey PRIMARY KEY (id);


--
-- Name: player_in_gane player_in_gane_chicken1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_in_gane
    ADD CONSTRAINT player_in_gane_chicken1_fkey FOREIGN KEY (chicken1) REFERENCES public.player(id);


--
-- Name: player_in_gane player_in_gane_chicken2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_in_gane
    ADD CONSTRAINT player_in_gane_chicken2_fkey FOREIGN KEY (chicken2) REFERENCES public.player(id);


--
-- Name: player_in_gane player_in_gane_chicken3_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_in_gane
    ADD CONSTRAINT player_in_gane_chicken3_fkey FOREIGN KEY (chicken3) REFERENCES public.player(id);


--
-- Name: player_in_gane player_in_gane_chicken4_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_in_gane
    ADD CONSTRAINT player_in_gane_chicken4_fkey FOREIGN KEY (chicken4) REFERENCES public.player(id);


--
-- Name: player_in_gane player_in_gane_chicken5_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_in_gane
    ADD CONSTRAINT player_in_gane_chicken5_fkey FOREIGN KEY (chicken5) REFERENCES public.player(id);


--
-- Name: player_in_gane player_in_gane_chicken6_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_in_gane
    ADD CONSTRAINT player_in_gane_chicken6_fkey FOREIGN KEY (chicken6) REFERENCES public.player(id);


--
-- Name: player_in_gane player_in_gane_chicken7_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_in_gane
    ADD CONSTRAINT player_in_gane_chicken7_fkey FOREIGN KEY (chicken7) REFERENCES public.player(id);


--
-- Name: player_in_gane player_in_gane_game_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_in_gane
    ADD CONSTRAINT player_in_gane_game_fkey FOREIGN KEY (game) REFERENCES public.game(id);


--
-- Name: player_in_gane player_in_gane_shooter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_in_gane
    ADD CONSTRAINT player_in_gane_shooter_fkey FOREIGN KEY (shooter) REFERENCES public.player(id);


--
-- PostgreSQL database dump complete
--

