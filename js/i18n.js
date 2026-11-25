/* PreBetPro – traduzioni (it, en, es, pt-BR). Nessuna dipendenza esterna. */
window.PBP_I18N = {
  it: {
    _locale: "it-IT", _name: "Italiano",
    nav_picks: "Top Picks", nav_live: "Partite", nav_pred: "Pronostici", nav_tennis: "Tennis", nav_report: "Report", nav_archive: "Archivio", nav_method: "Metodo",
    tagline: "Pronostici calcio e tennis basati sui dati",
    picks_title: "Top Picks", picks_sub: "Le giocate che superano il filtro di affidabilità del modello. Vengono congelate 3 ore prima del calcio d'inizio e valutate sul risultato dei 90'.",
    picks_none: "Nessuna partita supera il filtro di affidabilità in questo momento. I Top Picks vengono pubblicati solo con confidenza alta: trovi tutte le probabilità nella sezione Pronostici.",
    tennis_none_today: "Nessun pronostico tennis pubblicato per oggi. Il motore si aggiorna ogni 30 minuti.",
    live_title: "Partite del giorno", live_sub: "Risultati in diretta, primo tempo e finali dei campionati monitorati, con le probabilità principali del modello. Tocca una partita per i dettagli.",
    updated_at: "Aggiornato alle", next_update: "aggiornamento automatico ogni 15' durante le partite",
    yesterday: "Ieri", today: "Oggi", tomorrow: "Domani",
    all_countries: "Tutti i paesi", all_leagues: "Tutti i campionati", all_status: "Tutti gli stati", st_ns: "Da giocare", st_live: "In corso", st_ft: "Terminate", search_team: "Cerca squadra…",
    k_matches: "partite", k_live: "in corso", k_ft: "terminate", k_pred: "con pronostico", k_picks_today: "top picks oggi", k_hit30: "% vinti 30 gg",
    no_matches: "Nessuna partita per questa selezione.", no_data: "Dati non disponibili per questo giorno.", no_prediction: "nessun pronostico",
    details: "Dettagli", hide: "Chiudi", match_info: "Info partita", venue: "Stadio", referee: "Arbitro", kickoff: "Calcio d'inizio",
    timeline: "Cronaca", lineups: "Formazioni", subs: "Panchina", coach: "Allenatore", stats: "Statistiche", markets: "Tutti i mercati", model: "Modello",
    lineups_soon: "", events_after: "Formazioni, marcatori, cartellini e statistiche vengono pubblicati a fine partita per i campionati principali, le coppe europee e le partite con Top Pick.",
    no_details: "Dettagli non ancora disponibili.", min8: "Storico insufficiente per queste squadre (minimo 8 partite per squadra).",
    conf_high: "Confidenza alta", conf_medium: "Confidenza media", conf_low: "Confidenza bassa", xg: "Gol attesi", sigma: "Dispersione σ",
    top_pick: "Top Pick", frozen: "congelato",
    pred_title: "Pronostici", pred_sub: "Tutti i mercati calcolati dal modello per ogni partita. In evidenza i valori oltre la soglia del mercato: solo quelli delle partite a confidenza alta diventano Top Picks.",
    all_markets: "Tutti i mercati", g_1x2: "1X2", g_dc: "Doppia chance", g_goals: "Under / Over", g_btts: "Goal / No Goal", all_conf: "Tutte le confidenze", only_high: "Solo confidenza alta", med_plus: "Media o alta", only_strong: "Solo valori forti",
    no_pred: "Nessun pronostico per questa selezione.", without_pred: "partite senza pronostico: storico insufficiente per una delle squadre.",
    tennis_title: "Tennis", tennis_sub: "Favoriti dei tabelloni principali ATP, WTA e Challenger con probabilità stimata tra 68% e 82%. Quota equa = 1 / probabilità; quota minima = prezzo più basso che conviene accettare.",
    to_win: "vince", fair: "Quota equa", min_odds: "Quota min", score: "Punteggio", tennis_none: "Nessun pronostico tennis per questo giorno.", k_picks: "pronostici", k_graded30: "valutati (30 gg)", k_wl: "vinti / persi",
    report_title: "Report", report_sub: "Risultati dei Top Picks pubblicati, valutati automaticamente a fine partita.",
    r_total: "Pick totali", r_won: "Vinti", r_lost: "Persi", r_acc: "Precisione", r_by_market: "Rendimento per mercato", r_market: "Mercato",
    r_hist: "Rendimento storico", r_hist_sub: "Risultati aggregati dei soli Top Picks. Scegli il periodo da analizzare.", r_period: "Periodo", r_today: "Oggi", r_7: "Ultimi 7 giorni", r_30: "Ultimi 30 giorni", r_60: "Ultimi 60 giorni",
    r_trend: "Andamento precisione", r_wl: "Vinti / Persi", r_picks: "Pick valutati", r_empty: "Nessun report disponibile per il periodo. I Top Picks vengono valutati solo a fine partita.", r_tennis: "Tennis (ultimi 30 giorni)",
    win: "VINTO", loss: "PERSO", void: "ANNULLATO", pending: "IN ATTESA",
    archive_title: "Archivio", archive_sub: "Lo storico giorno per giorno di tutto ciò che è stato pubblicato: partite, risultati, probabilità e esito di ogni pick.",
    day: "Giorno", prev: "‹ Prec", next: "Succ ›", day_picks: "Pick del giorno", day_matches: "Partite", no_picks_day: "Nessun pick pubblicato in questo giorno.",
    method_title: "Metodo",
    method_html: "<h3>Modello calcio</h3><p>Per ogni squadra il sistema conserva gli ultimi 15 risultati, separati tra casa e trasferta. I gol attesi di ciascuna squadra derivano dalla media ponderata dei gol totali delle partite recenti (ultime 5 peso 1,5; 5 precedenti peso 1,0; le più vecchie 0,7) e vengono combinati in un modello di Poisson che calcola la probabilità di ogni risultato da 0-0 a 5-5.</p><p>Da questi risultati il sito ricava 1X2, Doppia chance, Under/Over 1,5 e 2,5, Goal/No Goal. La confidenza dipende da quanto sono stabili i risultati delle squadre: <strong>alta</strong>, <strong>media</strong> o <strong>bassa</strong>. Servono almeno 8 partite registrate per squadra.</p><p>Un mercato è <em>forte</em> quando supera la propria soglia (es. 1 o 2 ≥ 70%, Over 1,5 ≥ 72%, Under 2,5 ≥ 65%). I <strong>Top Picks</strong> sono i mercati forti delle partite a confidenza alta con probabilità di almeno il 73% (regola in vigore dal 22/11/2026, modello A-73), in ordine di probabilità (massimo 20 al giorno). Nel Report puoi confrontare tre livelli: tutte le previsioni, quelle sopra soglia e i Top Picks. Ogni pick viene congelato prima del via e valutato sul risultato dei 90': report e archivio mostrano tutti gli esiti, vinti e persi.</p><h3>Modello tennis</h3><p>Le quote del bookmaker più efficiente vengono trasformate in probabilità senza margine. Si pubblicano solo i favoriti tra 68% e 82% nei singolari dei tabelloni principali ATP, WTA e Challenger, con quota equa (1/p) e quota minima consigliata.</p><h3>Aggiornamenti</h3><p>Durante il giorno partite e risultati si aggiornano ogni 15 minuti quando ci sono partite in corso; formazioni, marcatori e statistiche vengono scaricati a fine partita per i campionati principali, le coppe europee e le partite con Top Pick. Di notte (00:00–08:00) gli aggiornamenti sono sospesi.</p><p class=\"warn\">Stime statistiche, mai certezze. Il gioco comporta rischio di perdita. Vietato ai minori di 18 anni · Gioca responsabilmente.</p>",
    footer: "Pronostici calcio e tennis basati sui dati", disclaimer: "Le probabilità sono stime statistiche, non garanzie. 18+ · Gioca responsabilmente.", data_ref: "Dati aggiornati",
    unavailable: "Dati momentaneamente non disponibili. Riprova tra qualche minuto.", not_found: "Partita non trovata.",
    m_goal: "Goal", m_nogoal: "No Goal", ev_goal: "Gol", ev_own: "autogol", ev_pen: "rigore", ev_miss: "rigore sbagliato", ev_sub: "Sostituzione", ev_var: "VAR",
    s_shots_on: "Tiri in porta", s_shots: "Tiri totali", s_poss: "Possesso palla", s_corners: "Calci d'angolo", s_fouls: "Falli", s_off: "Fuorigioco", s_yc: "Ammonizioni", s_rc: "Espulsioni", s_saves: "Parate", s_xg: "Gol attesi (xG)",
    status: { NS: "Da giocare", TBD: "Da definire", "1H": "1° tempo", HT: "Intervallo", "2H": "2° tempo", ET: "Supplementari", BT: "Pausa", P: "Rigori", SUSP: "Sospesa", INT: "Interrotta", FT: "Finale", AET: "Dopo suppl.", PEN: "Dopo rigori", PST: "Rinviata", CANC: "Annullata", ABD: "Abbandonata", AWD: "Tavolino", WO: "Walkover", LIVE: "In corso" }
  },
  en: {
    _locale: "en-GB", _name: "English",
    nav_picks: "Top Picks", nav_live: "Matches", nav_pred: "Predictions", nav_tennis: "Tennis", nav_report: "Report", nav_archive: "Archive", nav_method: "Method",
    tagline: "Data-driven football & tennis predictions",
    picks_title: "Top Picks", picks_sub: "Picks that pass the model's reliability filter. They are frozen 3 hours before kick-off and graded on the 90-minute result.",
    picks_none: "No match passes the reliability filter right now. Top Picks are published only with high confidence: all probabilities are in the Predictions section.",
    tennis_none_today: "No tennis pick published for today yet. The engine refreshes every 30 minutes.",
    live_title: "Today's matches", live_sub: "Live, half-time and full-time scores for the monitored leagues, with the model's main probabilities. Tap a match for details.",
    updated_at: "Updated at", next_update: "auto-refresh every 15' while matches are on",
    yesterday: "Yesterday", today: "Today", tomorrow: "Tomorrow",
    all_countries: "All countries", all_leagues: "All leagues", all_status: "All statuses", st_ns: "Not started", st_live: "Live", st_ft: "Finished", search_team: "Search team…",
    k_matches: "matches", k_live: "live", k_ft: "finished", k_pred: "with prediction", k_picks_today: "top picks today", k_hit30: "hit rate 30d",
    no_matches: "No matches for this selection.", no_data: "No data for this day.", no_prediction: "no prediction",
    details: "Details", hide: "Close", match_info: "Match info", venue: "Stadium", referee: "Referee", kickoff: "Kick-off",
    timeline: "Timeline", lineups: "Line-ups", subs: "Bench", coach: "Coach", stats: "Statistics", markets: "All markets", model: "Model",
    lineups_soon: "", events_after: "Line-ups, scorers, cards and statistics are published after full time for the main leagues, European cups and matches with a Top Pick.",
    no_details: "Details not available yet.", min8: "Not enough history for these teams (min. 8 matches per team).",
    conf_high: "High confidence", conf_medium: "Medium confidence", conf_low: "Low confidence", xg: "Expected goals", sigma: "Dispersion σ",
    top_pick: "Top Pick", frozen: "frozen",
    pred_title: "Predictions", pred_sub: "Every market computed by the model for each match. Highlighted values exceed the market threshold: only those of high-confidence matches become Top Picks.",
    all_markets: "All markets", g_1x2: "1X2", g_dc: "Double chance", g_goals: "Under / Over", g_btts: "Both teams to score", all_conf: "All confidence levels", only_high: "High confidence only", med_plus: "Medium or high", only_strong: "Strong values only",
    no_pred: "No predictions for this selection.", without_pred: "matches without prediction: not enough history for one of the teams.",
    tennis_title: "Tennis", tennis_sub: "Favourites from ATP, WTA and Challenger main draws with an estimated win probability between 68% and 82%. Fair odds = 1 / probability; min odds = lowest price worth taking.",
    to_win: "to win", fair: "Fair odds", min_odds: "Min odds", score: "Score", tennis_none: "No tennis picks for this day.", k_picks: "picks", k_graded30: "graded (30d)", k_wl: "won / lost",
    report_title: "Report", report_sub: "Results of the published Top Picks, graded automatically after full time.",
    r_total: "Total picks", r_won: "Won", r_lost: "Lost", r_acc: "Accuracy", r_by_market: "Performance by market", r_market: "Market",
    r_hist: "Historical performance", r_hist_sub: "Aggregated results of Top Picks only. Select a time range to analyse.", r_period: "Period", r_today: "Today", r_7: "Last 7 days", r_30: "Last 30 days", r_60: "Last 60 days",
    r_trend: "Accuracy trend", r_wl: "Won / Lost", r_picks: "Graded picks", r_empty: "No report for this period yet. Top Picks are graded only after full time.", r_tennis: "Tennis (last 30 days)",
    win: "WON", loss: "LOST", void: "VOID", pending: "PENDING",
    archive_title: "Archive", archive_sub: "Day-by-day record of everything published: matches, scores, probabilities and the outcome of every pick.",
    day: "Day", prev: "‹ Prev", next: "Next ›", day_picks: "Picks of the day", day_matches: "Matches", no_picks_day: "No picks were published on this day.",
    method_title: "Method",
    method_html: "<h3>Football model</h3><p>For every team the system keeps its last 15 results, home and away separately. Each side's expected goals come from the weighted average of total goals in recent matches (last 5 weigh 1.5, previous 5 weigh 1.0, older 0.7) and are combined into a Poisson model giving the probability of every score from 0-0 to 5-5.</p><p>From those scores the site derives 1X2, Double chance, Under/Over 1.5 and 2.5, Both teams to score. Confidence depends on how stable the teams' results have been: <strong>high</strong>, <strong>medium</strong> or <strong>low</strong>. At least 8 recorded matches per team are required.</p><p>A market is <em>strong</em> when it exceeds its own threshold (e.g. 1 or 2 ≥ 70%, Over 1.5 ≥ 72%, Under 2.5 ≥ 65%). <strong>Top Picks</strong> are the strong markets of high-confidence matches with a probability of at least 73% (rule in force since 22/11/2026, model A-73), ranked by probability (max 20 per day). In the Report you can compare three levels: all predictions, those above threshold and Top Picks. Each pick is frozen before kick-off and graded on the 90-minute score: report and archive show every outcome, wins and losses alike.</p><h3>Tennis model</h3><p>Prices from the sharpest bookmaker are turned into margin-free probabilities. Only favourites between 68% and 82% in ATP, WTA and Challenger main-draw singles are published, with fair odds (1/p) and the recommended minimum odds.</p><h3>Updates</h3><p>During the day matches and scores refresh every 15 minutes while games are on; line-ups, scorers and statistics are downloaded after full time for the main leagues, European cups and matches with a Top Pick. Overnight (00:00–08:00 CET) updates are paused.</p><p class=\"warn\">Statistical estimates, never guarantees. Gambling involves risk of loss. 18+ only · Play responsibly.</p>",
    footer: "Data-driven football & tennis predictions", disclaimer: "Probabilities are statistical estimates, not guarantees. 18+ · Play responsibly.", data_ref: "Data refreshed",
    unavailable: "Data temporarily unavailable. Please retry in a few minutes.", not_found: "Match not found.",
    m_goal: "BTTS Yes", m_nogoal: "BTTS No", ev_goal: "Goal", ev_own: "own goal", ev_pen: "penalty", ev_miss: "missed penalty", ev_sub: "Substitution", ev_var: "VAR",
    s_shots_on: "Shots on target", s_shots: "Total shots", s_poss: "Possession", s_corners: "Corners", s_fouls: "Fouls", s_off: "Offsides", s_yc: "Yellow cards", s_rc: "Red cards", s_saves: "Saves", s_xg: "Expected goals (xG)",
    status: { NS: "Not started", TBD: "TBD", "1H": "1st half", HT: "Half-time", "2H": "2nd half", ET: "Extra time", BT: "Break", P: "Penalties", SUSP: "Suspended", INT: "Interrupted", FT: "Full time", AET: "After extra time", PEN: "After penalties", PST: "Postponed", CANC: "Cancelled", ABD: "Abandoned", AWD: "Awarded", WO: "Walkover", LIVE: "Live" }
  },
  es: {
    _locale: "es-ES", _name: "Español",
    nav_picks: "Top Picks", nav_live: "Partidos", nav_pred: "Pronósticos", nav_tennis: "Tenis", nav_report: "Informe", nav_archive: "Archivo", nav_method: "Método",
    tagline: "Pronósticos de fútbol y tenis basados en datos",
    picks_title: "Top Picks", picks_sub: "Las apuestas que superan el filtro de fiabilidad del modelo. Se congelan 3 horas antes del inicio y se evalúan con el resultado de los 90'.",
    picks_none: "Ningún partido supera ahora el filtro de fiabilidad. Los Top Picks solo se publican con confianza alta: todas las probabilidades están en Pronósticos.",
    tennis_none_today: "Todavía no hay pronósticos de tenis para hoy. El motor se actualiza cada 30 minutos.",
    live_title: "Partidos de hoy", live_sub: "Resultados en directo, al descanso y finales de las ligas monitorizadas, con las probabilidades principales del modelo. Toca un partido para ver los detalles.",
    updated_at: "Actualizado a las", next_update: "actualización automática cada 15' durante los partidos",
    yesterday: "Ayer", today: "Hoy", tomorrow: "Mañana",
    all_countries: "Todos los países", all_leagues: "Todas las ligas", all_status: "Todos los estados", st_ns: "Por jugar", st_live: "En directo", st_ft: "Finalizados", search_team: "Buscar equipo…",
    k_matches: "partidos", k_live: "en directo", k_ft: "finalizados", k_pred: "con pronóstico", k_picks_today: "top picks hoy", k_hit30: "% acierto 30 d",
    no_matches: "No hay partidos para esta selección.", no_data: "No hay datos para este día.", no_prediction: "sin pronóstico",
    details: "Detalles", hide: "Cerrar", match_info: "Info del partido", venue: "Estadio", referee: "Árbitro", kickoff: "Inicio",
    timeline: "Crónica", lineups: "Alineaciones", subs: "Suplentes", coach: "Entrenador", stats: "Estadísticas", markets: "Todos los mercados", model: "Modelo",
    lineups_soon: "", events_after: "Alineaciones, goleadores, tarjetas y estadísticas se publican al final del partido para las ligas principales, las copas europeas y los partidos con Top Pick.",
    no_details: "Detalles aún no disponibles.", min8: "Historial insuficiente para estos equipos (mínimo 8 partidos por equipo).",
    conf_high: "Confianza alta", conf_medium: "Confianza media", conf_low: "Confianza baja", xg: "Goles esperados", sigma: "Dispersión σ",
    top_pick: "Top Pick", frozen: "congelado",
    pred_title: "Pronósticos", pred_sub: "Todos los mercados calculados por el modelo para cada partido. Se destacan los valores por encima del umbral: solo los de partidos con confianza alta se convierten en Top Picks.",
    all_markets: "Todos los mercados", g_1x2: "1X2", g_dc: "Doble oportunidad", g_goals: "Más / Menos", g_btts: "Ambos marcan", all_conf: "Todas las confianzas", only_high: "Solo confianza alta", med_plus: "Media o alta", only_strong: "Solo valores fuertes",
    no_pred: "No hay pronósticos para esta selección.", without_pred: "partidos sin pronóstico: historial insuficiente de uno de los equipos.",
    tennis_title: "Tenis", tennis_sub: "Favoritos de los cuadros principales ATP, WTA y Challenger con una probabilidad estimada entre 68% y 82%. Cuota justa = 1 / probabilidad; cuota mínima = precio más bajo que conviene aceptar.",
    to_win: "gana", fair: "Cuota justa", min_odds: "Cuota mín", score: "Marcador", tennis_none: "No hay pronósticos de tenis para este día.", k_picks: "pronósticos", k_graded30: "evaluados (30 d)", k_wl: "ganados / perdidos",
    report_title: "Informe", report_sub: "Resultados de los Top Picks publicados, evaluados automáticamente al final del partido.",
    r_total: "Picks totales", r_won: "Ganados", r_lost: "Perdidos", r_acc: "Acierto", r_by_market: "Rendimiento por mercado", r_market: "Mercado",
    r_hist: "Rendimiento histórico", r_hist_sub: "Resultados agregados solo de los Top Picks. Elige el periodo a analizar.", r_period: "Periodo", r_today: "Hoy", r_7: "Últimos 7 días", r_30: "Últimos 30 días", r_60: "Últimos 60 días",
    r_trend: "Evolución del acierto", r_wl: "Ganados / Perdidos", r_picks: "Picks evaluados", r_empty: "Aún no hay informe para este periodo. Los Top Picks se evalúan solo al final del partido.", r_tennis: "Tenis (últimos 30 días)",
    win: "GANADO", loss: "PERDIDO", void: "ANULADO", pending: "PENDIENTE",
    archive_title: "Archivo", archive_sub: "El historial día a día de todo lo publicado: partidos, resultados, probabilidades y el resultado de cada pick.",
    day: "Día", prev: "‹ Ant", next: "Sig ›", day_picks: "Picks del día", day_matches: "Partidos", no_picks_day: "No se publicaron picks este día.",
    method_title: "Método",
    method_html: "<h3>Modelo de fútbol</h3><p>Para cada equipo el sistema guarda sus últimos 15 resultados, separados entre local y visitante. Los goles esperados de cada equipo salen de la media ponderada de goles totales de los partidos recientes (últimos 5 peso 1,5; 5 anteriores 1,0; los más antiguos 0,7) y se combinan en un modelo de Poisson que da la probabilidad de cada marcador de 0-0 a 5-5.</p><p>De esos marcadores el sitio obtiene 1X2, Doble oportunidad, Más/Menos 1,5 y 2,5 y Ambos marcan. La confianza depende de la estabilidad de los resultados: <strong>alta</strong>, <strong>media</strong> o <strong>baja</strong>. Se necesitan al menos 8 partidos registrados por equipo.</p><p>Un mercado es <em>fuerte</em> cuando supera su umbral (p. ej. 1 o 2 ≥ 70%, Más de 1,5 ≥ 72%, Menos de 2,5 ≥ 65%). Los <strong>Top Picks</strong> son los mercados fuertes de partidos con confianza alta y probabilidad de al menos el 73% (regla vigente desde el 22/11/2026, modelo A-73), ordenados por probabilidad (máximo 20 al día). En el Informe puedes comparar tres niveles: todas las predicciones, las que superan el umbral y los Top Picks. Cada pick se congela antes del inicio y se evalúa con el marcador de los 90': informe y archivo muestran todos los resultados, ganados y perdidos.</p><h3>Modelo de tenis</h3><p>Las cuotas de la casa más eficiente se convierten en probabilidades sin margen. Solo se publican favoritos entre 68% y 82% en individuales de cuadros principales ATP, WTA y Challenger, con cuota justa (1/p) y cuota mínima recomendada.</p><h3>Actualizaciones</h3><p>Durante el día partidos y resultados se actualizan cada 15 minutos cuando hay partidos en juego; alineaciones, goleadores y estadísticas se descargan al final del partido para las ligas principales, las copas europeas y los partidos con Top Pick. De noche (00:00–08:00 CET) las actualizaciones se detienen.</p><p class=\"warn\">Estimaciones estadísticas, nunca certezas. El juego implica riesgo de pérdida. Solo mayores de 18 años · Juega con responsabilidad.</p>",
    footer: "Pronósticos de fútbol y tenis basados en datos", disclaimer: "Las probabilidades son estimaciones estadísticas, no garantías. +18 · Juega con responsabilidad.", data_ref: "Datos actualizados",
    unavailable: "Datos no disponibles en este momento. Vuelve a intentarlo en unos minutos.", not_found: "Partido no encontrado.",
    m_goal: "Ambos marcan: Sí", m_nogoal: "Ambos marcan: No", ev_goal: "Gol", ev_own: "en propia", ev_pen: "penalti", ev_miss: "penalti fallado", ev_sub: "Cambio", ev_var: "VAR",
    s_shots_on: "Tiros a puerta", s_shots: "Tiros totales", s_poss: "Posesión", s_corners: "Córners", s_fouls: "Faltas", s_off: "Fueras de juego", s_yc: "Amarillas", s_rc: "Rojas", s_saves: "Paradas", s_xg: "Goles esperados (xG)",
    status: { NS: "Por jugar", TBD: "Por definir", "1H": "1ª parte", HT: "Descanso", "2H": "2ª parte", ET: "Prórroga", BT: "Pausa", P: "Penaltis", SUSP: "Suspendido", INT: "Interrumpido", FT: "Final", AET: "Tras prórroga", PEN: "Tras penaltis", PST: "Aplazado", CANC: "Cancelado", ABD: "Abandonado", AWD: "Adjudicado", WO: "Walkover", LIVE: "En directo" }
  },
  pt: {
    _locale: "pt-BR", _name: "Português (BR)",
    nav_picks: "Top Picks", nav_live: "Jogos", nav_pred: "Palpites", nav_tennis: "Tênis", nav_report: "Relatório", nav_archive: "Arquivo", nav_method: "Método",
    tagline: "Palpites de futebol e tênis baseados em dados",
    picks_title: "Top Picks", picks_sub: "As apostas que passam no filtro de confiabilidade do modelo. São congeladas 3 horas antes do início e avaliadas pelo resultado dos 90'.",
    picks_none: "Nenhum jogo passa no filtro de confiabilidade agora. Os Top Picks só são publicados com confiança alta: todas as probabilidades estão em Palpites.",
    tennis_none_today: "Ainda não há palpites de tênis para hoje. O motor atualiza a cada 30 minutos.",
    live_title: "Jogos de hoje", live_sub: "Placares ao vivo, de intervalo e finais das ligas monitoradas, com as principais probabilidades do modelo. Toque em um jogo para ver os detalhes.",
    updated_at: "Atualizado às", next_update: "atualização automática a cada 15' durante os jogos",
    yesterday: "Ontem", today: "Hoje", tomorrow: "Amanhã",
    all_countries: "Todos os países", all_leagues: "Todas as ligas", all_status: "Todos os status", st_ns: "A jogar", st_live: "Ao vivo", st_ft: "Encerrados", search_team: "Buscar time…",
    k_matches: "jogos", k_live: "ao vivo", k_ft: "encerrados", k_pred: "com palpite", k_picks_today: "top picks hoje", k_hit30: "% acerto 30 d",
    no_matches: "Nenhum jogo para esta seleção.", no_data: "Sem dados para este dia.", no_prediction: "sem palpite",
    details: "Detalhes", hide: "Fechar", match_info: "Info do jogo", venue: "Estádio", referee: "Árbitro", kickoff: "Início",
    timeline: "Lance a lance", lineups: "Escalações", subs: "Reservas", coach: "Técnico", stats: "Estatísticas", markets: "Todos os mercados", model: "Modelo",
    lineups_soon: "", events_after: "Escalações, gols, cartões e estatísticas são publicados no fim do jogo para as principais ligas, as copas europeias e os jogos com Top Pick.",
    no_details: "Detalhes ainda não disponíveis.", min8: "Histórico insuficiente para estes times (mínimo de 8 jogos por time).",
    conf_high: "Confiança alta", conf_medium: "Confiança média", conf_low: "Confiança baixa", xg: "Gols esperados", sigma: "Dispersão σ",
    top_pick: "Top Pick", frozen: "congelado",
    pred_title: "Palpites", pred_sub: "Todos os mercados calculados pelo modelo para cada jogo. Em destaque os valores acima do limite do mercado: só os de jogos com confiança alta viram Top Picks.",
    all_markets: "Todos os mercados", g_1x2: "1X2", g_dc: "Dupla chance", g_goals: "Mais / Menos", g_btts: "Ambas marcam", all_conf: "Todas as confianças", only_high: "Só confiança alta", med_plus: "Média ou alta", only_strong: "Só valores fortes",
    no_pred: "Nenhum palpite para esta seleção.", without_pred: "jogos sem palpite: histórico insuficiente de um dos times.",
    tennis_title: "Tênis", tennis_sub: "Favoritos das chaves principais ATP, WTA e Challenger com probabilidade estimada entre 68% e 82%. Odd justa = 1 / probabilidade; odd mínima = menor preço que vale aceitar.",
    to_win: "vence", fair: "Odd justa", min_odds: "Odd mín", score: "Placar", tennis_none: "Nenhum palpite de tênis para este dia.", k_picks: "palpites", k_graded30: "avaliados (30 d)", k_wl: "ganhos / perdidos",
    report_title: "Relatório", report_sub: "Resultados dos Top Picks publicados, avaliados automaticamente no fim do jogo.",
    r_total: "Picks totais", r_won: "Ganhos", r_lost: "Perdidos", r_acc: "Acerto", r_by_market: "Desempenho por mercado", r_market: "Mercado",
    r_hist: "Desempenho histórico", r_hist_sub: "Resultados agregados apenas dos Top Picks. Escolha o período a analisar.", r_period: "Período", r_today: "Hoje", r_7: "Últimos 7 dias", r_30: "Últimos 30 dias", r_60: "Últimos 60 dias",
    r_trend: "Evolução do acerto", r_wl: "Ganhos / Perdidos", r_picks: "Picks avaliados", r_empty: "Ainda não há relatório para este período. Os Top Picks são avaliados só no fim do jogo.", r_tennis: "Tênis (últimos 30 dias)",
    win: "GANHO", loss: "PERDIDO", void: "ANULADO", pending: "PENDENTE",
    archive_title: "Arquivo", archive_sub: "O histórico dia a dia de tudo o que foi publicado: jogos, placares, probabilidades e o resultado de cada pick.",
    day: "Dia", prev: "‹ Ant", next: "Próx ›", day_picks: "Picks do dia", day_matches: "Jogos", no_picks_day: "Nenhum pick publicado neste dia.",
    method_title: "Método",
    method_html: "<h3>Modelo de futebol</h3><p>Para cada time o sistema guarda os últimos 15 resultados, separados entre mandante e visitante. Os gols esperados de cada time vêm da média ponderada dos gols totais dos jogos recentes (últimos 5 peso 1,5; 5 anteriores 1,0; os mais antigos 0,7) e são combinados em um modelo de Poisson que dá a probabilidade de cada placar de 0-0 a 5-5.</p><p>Desses placares o site calcula 1X2, Dupla chance, Mais/Menos 1,5 e 2,5 e Ambas marcam. A confiança depende da estabilidade dos resultados: <strong>alta</strong>, <strong>média</strong> ou <strong>baixa</strong>. São necessários pelo menos 8 jogos registrados por time.</p><p>Um mercado é <em>forte</em> quando passa do seu limite (ex.: 1 ou 2 ≥ 70%, Mais de 1,5 ≥ 72%, Menos de 2,5 ≥ 65%). Os <strong>Top Picks</strong> são os mercados fortes dos jogos com confiança alta e probabilidade de pelo menos 73% (regra em vigor desde 22/11/2026, modelo A-73), em ordem de probabilidade (máximo 20 por dia). No Relatório você pode comparar três níveis: todas as previsões, as acima do limite e os Top Picks. Cada pick é congelado antes do início e avaliado pelo placar dos 90': relatório e arquivo mostram todos os resultados, ganhos e perdidos.</p><h3>Modelo de tênis</h3><p>As odds da casa mais eficiente são convertidas em probabilidades sem margem. Só são publicados favoritos entre 68% e 82% em simples das chaves principais ATP, WTA e Challenger, com odd justa (1/p) e odd mínima recomendada.</p><h3>Atualizações</h3><p>Durante o dia jogos e placares são atualizados a cada 15 minutos quando há partidas em andamento; escalações, gols e estatísticas são baixados no fim do jogo para as principais ligas, as copas europeias e os jogos com Top Pick. À noite (00:00–08:00, horário da Itália) as atualizações ficam pausadas.</p><p class=\"warn\">Estimativas estatísticas, nunca certezas. Apostar envolve risco de perda. Proibido para menores de 18 anos · Jogue com responsabilidade.</p>",
    footer: "Palpites de futebol e tênis baseados em dados", disclaimer: "As probabilidades são estimativas estatísticas, não garantias. 18+ · Jogue com responsabilidade.", data_ref: "Dados atualizados",
    unavailable: "Dados indisponíveis no momento. Tente de novo em alguns minutos.", not_found: "Jogo não encontrado.",
    m_goal: "Ambas marcam: Sim", m_nogoal: "Ambas marcam: Não", ev_goal: "Gol", ev_own: "gol contra", ev_pen: "pênalti", ev_miss: "pênalti perdido", ev_sub: "Substituição", ev_var: "VAR",
    s_shots_on: "Chutes no gol", s_shots: "Finalizações", s_poss: "Posse de bola", s_corners: "Escanteios", s_fouls: "Faltas", s_off: "Impedimentos", s_yc: "Cartões amarelos", s_rc: "Cartões vermelhos", s_saves: "Defesas", s_xg: "Gols esperados (xG)",
    status: { NS: "A jogar", TBD: "A definir", "1H": "1º tempo", HT: "Intervalo", "2H": "2º tempo", ET: "Prorrogação", BT: "Pausa", P: "Pênaltis", SUSP: "Suspenso", INT: "Interrompido", FT: "Encerrado", AET: "Após prorrogação", PEN: "Após pênaltis", PST: "Adiado", CANC: "Cancelado", ABD: "Abandonado", AWD: "W.O. técnico", WO: "W.O.", LIVE: "Ao vivo" }
  }
};

/* v8: home con hero, pagine separate, filtri rapidi, paesi tradotti */
(function (I) {
  var add = {
    it: {
      nav_home: "Home", nav_pred: "Pronostici",
      hero_claim: "Solo le partite che contano", hero_sub: "Ogni giorno analizziamo tutto, pubblichiamo solo il meglio.",
      hero_today: "Oggi abbiamo analizzato {n} partite: solo {k} superano i nostri filtri.",
      hero_p1: "Dati reali", hero_p1t: "Risultati, calendari, formazioni e statistiche aggiornati in automatico.",
      hero_p2: "Modelli statistici", hero_p2t: "Probabilità calcolate per ogni mercato, senza sensazioni.",
      hero_p3: "Risultati verificati", hero_p3t: "Ogni pick viene valutato e resta pubblico nel report.",
      cta_pred: "Pronostici di oggi", cta_live: "Partite live",
      picks_box: "Selezione ristretta: tra tutte le partite analizzate pubblichiamo solo quelle che superano i nostri criteri di affidabilità. Pochi pronostici, scelti per qualità.",
      picks_count: "{k} su {n} partite", fb_title: "Calcio", tn_title: "Tennis", picks_today_title: "Top Picks di oggi",
      chip_all: "Tutte", chip_live: "In corso", chip_next3: "Prossime 3 ore", chip_ft: "Terminate", chip_top: "Campionati top", chip_strong: "Pronostico forte", chip_high: "Confidenza alta",
      show_more: "Mostra altre", shown_of: "{a} di {b}", col_time: "Ora", col_match: "Partita", col_conf: "Conf.", sort_hint: "Tocca un'intestazione per ordinare",
      more_markets: "Tutti i mercati", less_markets: "Meno mercati", round: "Giornata", tennis_full_soon: "L'elenco completo delle partite di tennis con risultati in diretta è in preparazione.",
      tn_none_picks: "Nessun pick tennis oggi.", fb_none_picks: "Nessuna partita di calcio supera i filtri in questo momento."
    },
    en: {
      nav_home: "Home", nav_pred: "Predictions",
      hero_claim: "Only the matches that matter", hero_sub: "Every day we analyse everything and publish only the best.",
      hero_today: "Today we analysed {n} matches: only {k} pass our filters.",
      hero_p1: "Real data", hero_p1t: "Results, fixtures, line-ups and stats updated automatically.",
      hero_p2: "Statistical models", hero_p2t: "Probabilities computed for every market, no gut feelings.",
      hero_p3: "Verified results", hero_p3t: "Every pick is graded and stays public in the report.",
      cta_pred: "Today's predictions", cta_live: "Live matches",
      picks_box: "A short list: out of all the matches we analyse, we publish only those that pass our reliability criteria. Few picks, chosen for quality.",
      picks_count: "{k} of {n} matches", fb_title: "Football", tn_title: "Tennis", picks_today_title: "Today's Top Picks",
      chip_all: "All", chip_live: "Live", chip_next3: "Next 3 hours", chip_ft: "Finished", chip_top: "Top leagues", chip_strong: "Strong pick", chip_high: "High confidence",
      show_more: "Show more", shown_of: "{a} of {b}", col_time: "Time", col_match: "Match", col_conf: "Conf.", sort_hint: "Tap a header to sort",
      more_markets: "All markets", less_markets: "Fewer markets", round: "Round", tennis_full_soon: "The full list of tennis matches with live scores is coming soon.",
      tn_none_picks: "No tennis picks today.", fb_none_picks: "No football match passes the filters right now."
    },
    es: {
      nav_home: "Inicio", nav_pred: "Pronósticos",
      hero_claim: "Solo los partidos que importan", hero_sub: "Cada día lo analizamos todo y publicamos solo lo mejor.",
      hero_today: "Hoy hemos analizado {n} partidos: solo {k} superan nuestros filtros.",
      hero_p1: "Datos reales", hero_p1t: "Resultados, calendarios, alineaciones y estadísticas actualizados automáticamente.",
      hero_p2: "Modelos estadísticos", hero_p2t: "Probabilidades calculadas para cada mercado, sin corazonadas.",
      hero_p3: "Resultados verificados", hero_p3t: "Cada pick se evalúa y queda público en el informe.",
      cta_pred: "Pronósticos de hoy", cta_live: "Partidos en directo",
      picks_box: "Selección reducida: de todos los partidos analizados publicamos solo los que superan nuestros criterios de fiabilidad. Pocos pronósticos, elegidos por calidad.",
      picks_count: "{k} de {n} partidos", fb_title: "Fútbol", tn_title: "Tenis", picks_today_title: "Top Picks de hoy",
      chip_all: "Todos", chip_live: "En directo", chip_next3: "Próximas 3 horas", chip_ft: "Finalizados", chip_top: "Ligas top", chip_strong: "Pronóstico fuerte", chip_high: "Confianza alta",
      show_more: "Mostrar más", shown_of: "{a} de {b}", col_time: "Hora", col_match: "Partido", col_conf: "Conf.", sort_hint: "Toca un encabezado para ordenar",
      more_markets: "Todos los mercados", less_markets: "Menos mercados", round: "Jornada", tennis_full_soon: "La lista completa de partidos de tenis con resultados en directo llegará pronto.",
      tn_none_picks: "Hoy no hay picks de tenis.", fb_none_picks: "Ningún partido de fútbol supera los filtros ahora mismo."
    },
    pt: {
      nav_home: "Início", nav_pred: "Palpites",
      hero_claim: "Só os jogos que importam", hero_sub: "Todo dia analisamos tudo e publicamos só o melhor.",
      hero_today: "Hoje analisamos {n} jogos: só {k} passam nos nossos filtros.",
      hero_p1: "Dados reais", hero_p1t: "Resultados, calendários, escalações e estatísticas atualizados automaticamente.",
      hero_p2: "Modelos estatísticos", hero_p2t: "Probabilidades calculadas para cada mercado, sem achismo.",
      hero_p3: "Resultados verificados", hero_p3t: "Cada pick é avaliado e fica público no relatório.",
      cta_pred: "Palpites de hoje", cta_live: "Jogos ao vivo",
      picks_box: "Seleção restrita: de todos os jogos analisados publicamos só os que passam nos nossos critérios de confiabilidade. Poucos palpites, escolhidos pela qualidade.",
      picks_count: "{k} de {n} jogos", fb_title: "Futebol", tn_title: "Tênis", picks_today_title: "Top Picks de hoje",
      chip_all: "Todos", chip_live: "Ao vivo", chip_next3: "Próximas 3 horas", chip_ft: "Encerrados", chip_top: "Ligas top", chip_strong: "Palpite forte", chip_high: "Confiança alta",
      show_more: "Mostrar mais", shown_of: "{a} de {b}", col_time: "Hora", col_match: "Jogo", col_conf: "Conf.", sort_hint: "Toque num cabeçalho para ordenar",
      more_markets: "Todos os mercados", less_markets: "Menos mercados", round: "Rodada", tennis_full_soon: "A lista completa de jogos de tênis com placares ao vivo está chegando.",
      tn_none_picks: "Nenhum pick de tênis hoje.", fb_none_picks: "Nenhum jogo de futebol passa nos filtros agora."
    }
  };
  var CC = { it: { England: "Inghilterra", Scotland: "Scozia", World: "Mondo", Europe: "Europa" }, en: { World: "World", Europe: "Europe" },
    es: { England: "Inglaterra", Scotland: "Escocia", World: "Mundo", Europe: "Europa" }, pt: { England: "Inglaterra", Scotland: "Escócia", World: "Mundo", Europe: "Europa" } };
  for (var l in add) { for (var k in add[l]) I[l][k] = add[l][k]; I[l]._countries = CC[l]; }
})(window.PBP_I18N);
/* v9: tennis completo + dettagli calcio estesi */
(function (I) {
  var add = {
    it: { inj_title: "Indisponibili", inj_missing: "Assente", inj_doubt: "In dubbio", mvp: "Migliore in campo", rating: "Voto", et: "Supplementari", pens: "Rigori", aet_short: "dts", pen_short: "rig.",
      s_shots_off: "Tiri fuori", s_blocked: "Tiri respinti", s_in: "Tiri in area", s_out: "Tiri da fuori", s_passes: "Passaggi", s_pacc: "Passaggi riusciti", s_ppct: "Precisione passaggi",
      tn_start: "Inizio", tn_canc_s: "Ann.", search_player: "Cerca giocatore o torneo...", legend_strong: "Verde = pronostico forte (solo partite a confidenza alta e mercato sopra la sua soglia) · grassetto = almeno 60%", ev_pending: "in aggiornamento", tn_picks_title: "Pick tennis", tn_all_title: "Tutte le partite", chip_atpwta: "ATP / WTA", chip_chall: "Challenger", chip_itf: "ITF", chip_tnft: "Concluse",
      tn_ended: "Fin.", tn_last: "Ultimo punteggio rilevato (risultato finale non disponibile)", tn_cancelled: "Annullata", tn_upd: "Aggiornato alle", tn_no_matches: "Nessuna partita per questo giorno.",
      sf_hard: "Cemento", sf_clay: "Terra battuta", sf_grass: "Erba", sf_carpet: "Sintetico", tn_indoor: "Indoor", tn_outdoor: "All'aperto", tn_court: "Campo", tn_round: "Turno", tn_format: "Formato", tn_bo3: "Al meglio dei 3 set", tn_bo5: "Al meglio dei 5 set",
      tn_rank: "Ranking", tn_serve: "Al servizio", tn_hand_R: "Destro", tn_hand_L: "Mancino", tn_born: "Classe", tn_doubles: "Doppio", tn_qual: "Qualificazioni", tn_info: "Info partita", tn_players: "Giocatori", tn_surface: "Superficie", tn_points: "Punti game", tn_tb: "tie-break", tn_winner: "Vincitore",
      tn_note: "Dati da Live Tennis API: ATP, WTA, Challenger e ITF, aggiornati ogni 30 minuti dalle 8 alle 24. Alcuni match di primo piano possono mancare." },
    en: { inj_title: "Unavailable", inj_missing: "Out", inj_doubt: "Doubtful", mvp: "Player of the match", rating: "Rating", et: "Extra time", pens: "Penalties", aet_short: "aet", pen_short: "pens",
      s_shots_off: "Shots off target", s_blocked: "Blocked shots", s_in: "Shots inside box", s_out: "Shots outside box", s_passes: "Passes", s_pacc: "Accurate passes", s_ppct: "Pass accuracy",
      tn_start: "Start", tn_canc_s: "Canc.", search_player: "Search player or tournament...", legend_strong: "Green = strong prediction (high-confidence matches only, market above its threshold) · bold = 60% or more", ev_pending: "updating", tn_picks_title: "Tennis picks", tn_all_title: "All matches", chip_atpwta: "ATP / WTA", chip_chall: "Challenger", chip_itf: "ITF", chip_tnft: "Finished",
      tn_ended: "End", tn_last: "Last score recorded (final result not available)", tn_cancelled: "Cancelled", tn_upd: "Updated at", tn_no_matches: "No matches for this day.",
      sf_hard: "Hard", sf_clay: "Clay", sf_grass: "Grass", sf_carpet: "Carpet", tn_indoor: "Indoor", tn_outdoor: "Outdoor", tn_court: "Court", tn_round: "Round", tn_format: "Format", tn_bo3: "Best of 3 sets", tn_bo5: "Best of 5 sets",
      tn_rank: "Ranking", tn_serve: "Serving", tn_hand_R: "Right-handed", tn_hand_L: "Left-handed", tn_born: "Born", tn_doubles: "Doubles", tn_qual: "Qualifying", tn_info: "Match info", tn_players: "Players", tn_surface: "Surface", tn_points: "Game points", tn_tb: "tie-break", tn_winner: "Winner",
      tn_note: "Data from Live Tennis API: ATP, WTA, Challenger and ITF, updated every 30 minutes from 8am to midnight (CET). Some top matches may be missing." },
    es: { inj_title: "Bajas", inj_missing: "Baja", inj_doubt: "Duda", mvp: "Mejor jugador", rating: "Nota", et: "Prórroga", pens: "Penaltis", aet_short: "prór.", pen_short: "pen.",
      s_shots_off: "Tiros fuera", s_blocked: "Tiros bloqueados", s_in: "Tiros dentro del área", s_out: "Tiros desde fuera", s_passes: "Pases", s_pacc: "Pases completados", s_ppct: "Precisión de pase",
      tn_start: "Inicio", tn_canc_s: "Canc.", search_player: "Buscar jugador o torneo...", legend_strong: "Verde = pronóstico fuerte (solo partidos de confianza alta y mercado por encima de su umbral) · negrita = 60% o más", ev_pending: "actualizando", tn_picks_title: "Picks de tenis", tn_all_title: "Todos los partidos", chip_atpwta: "ATP / WTA", chip_chall: "Challenger", chip_itf: "ITF", chip_tnft: "Terminados",
      tn_ended: "Fin", tn_last: "Último marcador registrado (resultado final no disponible)", tn_cancelled: "Cancelado", tn_upd: "Actualizado a las", tn_no_matches: "No hay partidos para este día.",
      sf_hard: "Pista dura", sf_clay: "Tierra batida", sf_grass: "Hierba", sf_carpet: "Moqueta", tn_indoor: "Bajo techo", tn_outdoor: "Al aire libre", tn_court: "Pista", tn_round: "Ronda", tn_format: "Formato", tn_bo3: "Al mejor de 3 sets", tn_bo5: "Al mejor de 5 sets",
      tn_rank: "Ranking", tn_serve: "Al saque", tn_hand_R: "Diestro", tn_hand_L: "Zurdo", tn_born: "Nacido en", tn_doubles: "Dobles", tn_qual: "Clasificación", tn_info: "Info del partido", tn_players: "Jugadores", tn_surface: "Superficie", tn_points: "Puntos del juego", tn_tb: "tie-break", tn_winner: "Ganador",
      tn_note: "Datos de Live Tennis API: ATP, WTA, Challenger e ITF, actualizados cada 30 minutos de 8 a 24 h (CET). Pueden faltar algunos partidos importantes." },
    pt: { inj_title: "Desfalques", inj_missing: "Fora", inj_doubt: "Dúvida", mvp: "Melhor em campo", rating: "Nota", et: "Prorrogação", pens: "Pênaltis", aet_short: "prorr.", pen_short: "pên.",
      s_shots_off: "Chutes para fora", s_blocked: "Chutes bloqueados", s_in: "Chutes dentro da área", s_out: "Chutes de fora", s_passes: "Passes", s_pacc: "Passes certos", s_ppct: "Precisão de passe",
      tn_start: "Início", tn_canc_s: "Canc.", search_player: "Buscar jogador ou torneio...", legend_strong: "Verde = palpite forte (só jogos de confiança alta e mercado acima do seu limite) · negrito = 60% ou mais", ev_pending: "atualizando", tn_picks_title: "Picks de tênis", tn_all_title: "Todos os jogos", chip_atpwta: "ATP / WTA", chip_chall: "Challenger", chip_itf: "ITF", chip_tnft: "Encerrados",
      tn_ended: "Fim", tn_last: "Último placar registrado (resultado final indisponível)", tn_cancelled: "Cancelado", tn_upd: "Atualizado às", tn_no_matches: "Nenhum jogo neste dia.",
      sf_hard: "Quadra dura", sf_clay: "Saibro", sf_grass: "Grama", sf_carpet: "Carpete", tn_indoor: "Coberta", tn_outdoor: "Ao ar livre", tn_court: "Quadra", tn_round: "Fase", tn_format: "Formato", tn_bo3: "Melhor de 3 sets", tn_bo5: "Melhor de 5 sets",
      tn_rank: "Ranking", tn_serve: "No saque", tn_hand_R: "Destro", tn_hand_L: "Canhoto", tn_born: "Nascido em", tn_doubles: "Duplas", tn_qual: "Qualificatório", tn_info: "Info do jogo", tn_players: "Jogadores", tn_surface: "Piso", tn_points: "Pontos do game", tn_tb: "tie-break", tn_winner: "Vencedor",
      tn_note: "Dados da Live Tennis API: ATP, WTA, Challenger e ITF, atualizados a cada 30 minutos das 8h à meia-noite (CET). Alguns jogos importantes podem faltar." }
  };
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);

(function (I) {
  var add = {
    it: { report_sub: "Risultati dei pronostici pubblicati (Top Picks) di calcio e tennis, valutati automaticamente a fine partita.", r_overview: "Riepilogo del periodo", r_football: "Calcio", r_tennis_s: "Tennis", r_combined: "Totale calcio + tennis",
      r_note: "Calcio e tennis sono conteggiati separatamente; il totale li somma. Ogni pronostico pubblicato conta come una giocata: una partita di calcio può avere fino a 2 pronostici, una di tennis 1. Sono contati solo i pronostici conclusi: quelli in attesa e le partite annullate sono esclusi.",
      r_fb_title: "⚽ Calcio – Top Picks", r_tn_title: "🎾 Tennis – Top Picks", r_tennis: "🎾 Tennis – Top Picks" },
    en: { report_sub: "Results of the published football and tennis predictions (Top Picks), graded automatically after the match.", r_overview: "Period summary", r_football: "Football", r_tennis_s: "Tennis", r_combined: "Total football + tennis",
      r_note: "Football and tennis are counted separately; the total adds them up. Each published prediction counts as one pick: a football match can have up to 2 predictions, a tennis match 1. Only settled picks are counted: pending picks and cancelled matches are excluded.",
      r_fb_title: "⚽ Football – Top Picks", r_tn_title: "🎾 Tennis – Top Picks", r_tennis: "🎾 Tennis – Top Picks" },
    es: { report_sub: "Resultados de los pronósticos publicados (Top Picks) de fútbol y tenis, evaluados automáticamente al final del partido.", r_overview: "Resumen del periodo", r_football: "Fútbol", r_tennis_s: "Tenis", r_combined: "Total fútbol + tenis",
      r_note: "Fútbol y tenis se cuentan por separado; el total los suma. Cada pronóstico publicado cuenta como una jugada: un partido de fútbol puede tener hasta 2 pronósticos, uno de tenis 1. Solo se cuentan los pronósticos resueltos: los pendientes y los partidos cancelados quedan excluidos.",
      r_fb_title: "⚽ Fútbol – Top Picks", r_tn_title: "🎾 Tenis – Top Picks", r_tennis: "🎾 Tenis – Top Picks" },
    pt: { report_sub: "Resultados dos palpites publicados (Top Picks) de futebol e tênis, avaliados automaticamente no fim do jogo.", r_overview: "Resumo do período", r_football: "Futebol", r_tennis_s: "Tênis", r_combined: "Total futebol + tênis",
      r_note: "Futebol e tênis são contados separadamente; o total soma os dois. Cada palpite publicado conta como uma aposta: um jogo de futebol pode ter até 2 palpites, um de tênis 1. Só entram os palpites resolvidos: os pendentes e os jogos cancelados ficam de fora.",
      r_fb_title: "⚽ Futebol – Top Picks", r_tn_title: "🎾 Tênis – Top Picks", r_tennis: "🎾 Tênis – Top Picks" }
  };
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);

(function (I) {
  var add = {
    it: { r_3m: "Ultimi 3 mesi", r_6m: "Ultimi 6 mesi", r_1y: "Ultimo anno", r_all: "Da sempre", r_custom: "Personalizzato", r_from: "Dal", r_to: "Al", r_avail: "dati disponibili dal {d}",
      r_comb_trend: "Precisione nel tempo: calcio, tennis e totale", r_total_s: "Totale", r_unit_d: "(per giorno)", r_unit_w: "(per settimana)", r_unit_m: "(per mese)",
      r_by_cat: "Rendimento per categoria di torneo", r_by_band: "Rendimento per fascia di probabilità", r_avgp: "Prob. media", r_other: "Altro",
      r_calib: "Probabilità media dei pick: {a} · precisione reale: {b}. Se i due valori sono vicini, le probabilità stimate sono affidabili.",
      r_show_all: "Mostra tutti ({n})", r_less: "Mostra meno", r_page: "Pagina {p} di {n}", k_pending: "In attesa", k_pending_s: "in attesa",
      tn_hist_link: "Storico completo dei risultati nel Report →", a_legend: "Archivio dal {d}. Sono cliccabili solo i giorni con dati. Verde = più pick vinti che persi, rosso = più persi, giallo = pari; il numero è vinti/persi (calcio + tennis).", a_no_matches: "Nessuna partita registrata per questo giorno.", ev_na: "gol senza dettaglio marcatore" },
    en: { r_3m: "Last 3 months", r_6m: "Last 6 months", r_1y: "Last year", r_all: "All time", r_custom: "Custom", r_from: "From", r_to: "To", r_avail: "data available since {d}",
      r_comb_trend: "Accuracy over time: football, tennis and total", r_total_s: "Total", r_unit_d: "(per day)", r_unit_w: "(per week)", r_unit_m: "(per month)",
      r_by_cat: "Performance by tournament category", r_by_band: "Performance by probability band", r_avgp: "Avg. prob.", r_other: "Other",
      r_calib: "Average pick probability: {a} · actual accuracy: {b}. When the two are close, the estimated probabilities are reliable.",
      r_show_all: "Show all ({n})", r_less: "Show less", r_page: "Page {p} of {n}", k_pending: "Pending", k_pending_s: "pending",
      tn_hist_link: "Full results history in the Report →", a_legend: "Archive since {d}. Only days with data can be selected. Green = more picks won than lost, red = more lost, yellow = even; the number is won/lost (football + tennis).", a_no_matches: "No matches recorded for this day.", ev_na: "goals without scorer details" },
    es: { r_3m: "Últimos 3 meses", r_6m: "Últimos 6 meses", r_1y: "Último año", r_all: "Desde siempre", r_custom: "Personalizado", r_from: "Desde", r_to: "Hasta", r_avail: "datos disponibles desde el {d}",
      r_comb_trend: "Acierto en el tiempo: fútbol, tenis y total", r_total_s: "Total", r_unit_d: "(por día)", r_unit_w: "(por semana)", r_unit_m: "(por mes)",
      r_by_cat: "Rendimiento por categoría de torneo", r_by_band: "Rendimiento por franja de probabilidad", r_avgp: "Prob. media", r_other: "Otros",
      r_calib: "Probabilidad media de los picks: {a} · acierto real: {b}. Si ambos valores están cerca, las probabilidades estimadas son fiables.",
      r_show_all: "Ver todos ({n})", r_less: "Ver menos", r_page: "Página {p} de {n}", k_pending: "Pendientes", k_pending_s: "pendientes",
      tn_hist_link: "Historial completo de resultados en el Informe →", a_legend: "Archivo desde el {d}. Solo se pueden elegir los días con datos. Verde = más picks ganados que perdidos, rojo = más perdidos, amarillo = empate; el número es ganados/perdidos (fútbol + tenis).", a_no_matches: "No hay partidos registrados este día.", ev_na: "goles sin detalle del goleador" },
    pt: { r_3m: "Últimos 3 meses", r_6m: "Últimos 6 meses", r_1y: "Último ano", r_all: "Desde sempre", r_custom: "Personalizado", r_from: "De", r_to: "Até", r_avail: "dados disponíveis desde {d}",
      r_comb_trend: "Acerto ao longo do tempo: futebol, tênis e total", r_total_s: "Total", r_unit_d: "(por dia)", r_unit_w: "(por semana)", r_unit_m: "(por mês)",
      r_by_cat: "Desempenho por categoria de torneio", r_by_band: "Desempenho por faixa de probabilidade", r_avgp: "Prob. média", r_other: "Outros",
      r_calib: "Probabilidade média dos palpites: {a} · acerto real: {b}. Quando os dois valores estão próximos, as probabilidades estimadas são confiáveis.",
      r_show_all: "Ver todos ({n})", r_less: "Ver menos", r_page: "Página {p} de {n}", k_pending: "Pendentes", k_pending_s: "pendentes",
      tn_hist_link: "Histórico completo de resultados no Relatório →", a_legend: "Arquivo desde {d}. Só os dias com dados podem ser escolhidos. Verde = mais palpites ganhos que perdidos, vermelho = mais perdidos, amarelo = empate; o número é ganhos/perdidos (futebol + tênis).", a_no_matches: "Nenhum jogo registrado neste dia.", ev_na: "gols sem detalhe do autor" }
  };
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);

(function (I) {
  var add = {
 "it": {
  "lv_all": "Tutte le previsioni",
  "lv_thr": "Sopra soglia",
  "lv_top": "Top Picks",
  "r_conf": "Confidenza",
  "r_conf_all": "Tutte",
  "cf_h": "Alta",
  "cf_m": "Media",
  "cf_l": "Bassa",
  "r_fb_h": "⚽ Calcio",
  "r_cmp": "Confronto dei livelli di selezione",
  "r_cmp_note": "Le percentuali sono confrontabili solo con campioni sufficienti (⚠ = meno di 30 casi) e mercati simili. Scarto = precisione reale meno probabilità media: positivo vuol dire che il modello è stato prudente, negativo che è stato ottimista.",
  "r_tn_only": "Per il tennis vengono registrati solo i Top Picks (favoriti con probabilità tra 68% e 82%).",
  "r_overview_top": "Riepilogo Top Picks del periodo",
  "r_cal_tip": "Previsti in media {a}% · avverati {b}% · {n} casi",
  "r_matches": "Partite",
  "r_main_ok": "Previsioni principali corrette",
  "r_brier": "Brier score (più basso = meglio)",
  "r_by_outcome": "Affidabilità per esito",
  "r_cases": "Casi",
  "r_freq": "Avverati",
  "r_gap": "Scarto",
  "r_matches_an": "Partite analizzate",
  "r_outcomes": "Esiti valutati",
  "r_all_note": "Livello 1: tutte le probabilità calcolate dal modello per ogni partita analizzata, anche quelle basse. Qui non conta la percentuale di successo ma l'affidabilità: un esito dato al 70% dovrebbe avverarsi circa 7 volte su 10. Previsione principale = esito più probabile di ogni mercato (1X2, doppia chance, Over/Under 1.5, Over/Under 2.5, Goal/No Goal). Brier score: 0 = perfetto, 0,25 = come tirare a caso.",
  "r_calchart": "Affidabilità delle probabilità",
  "r_calchart_note": "Ogni punto: esiti raggruppati per probabilità prevista. Più i punti stanno vicini alla diagonale, più le probabilità sono affidabili.",
  "r_main_trend": "Previsioni principali corrette nel tempo",
  "r_by_conf": "Per confidenza",
  "r_by_league": "Per campionato",
  "r_all_arch": "Il dettaglio partita per partita, con tutte le probabilità, è nell'Archivio.",
  "r_small": "Campione ancora piccolo: i valori possono cambiare molto.",
  "r_by_version": "Per versione del modello",
  "v_a": "Model A (fino al 21/11)",
  "v_a73": "Model A-73 (dal 22/11, minimo 73%)",
  "cmp_thr": "Sopra soglia – tutte le confidenze",
  "cmp_thr_lo": "Sopra soglia – confidenza media o bassa",
  "cmp_thr_hi": "Sopra soglia – confidenza alta",
  "lvn_all": "Livello 1 · tutte le probabilità di tutte le partite analizzate.",
  "lvn_thr": "Livello 2 · tutti gli esiti che superano la soglia del proprio mercato (1 e 2 ≥ 70%, X ≥ 60%, 1X/X2 ≥ 68%, 12 ≥ 72%, Over 1.5 ≥ 72%, Over 2.5 ≥ 68%, Under 2.5 ≥ 65%, Goal ≥ 69%, No Goal ≥ 66%), a qualsiasi confidenza.",
  "lvn_top": "Livello 3 · i pronostici pubblicati: sopra soglia, confidenza alta e, dal 22/11, probabilità almeno del 73%."
 },
 "en": {
  "lv_all": "All predictions",
  "lv_thr": "Above threshold",
  "lv_top": "Top Picks",
  "r_conf": "Confidence",
  "r_conf_all": "All",
  "cf_h": "High",
  "cf_m": "Medium",
  "cf_l": "Low",
  "r_fb_h": "⚽ Football",
  "r_cmp": "Comparison of selection levels",
  "r_cmp_note": "Percentages are comparable only with enough cases (⚠ = fewer than 30) and similar markets. Gap = actual accuracy minus average probability: positive means the model was cautious, negative that it was optimistic.",
  "r_tn_only": "For tennis only Top Picks are recorded (favourites with a probability between 68% and 82%).",
  "r_overview_top": "Top Picks summary for the period",
  "r_cal_tip": "Predicted on average {a}% · happened {b}% · {n} cases",
  "r_matches": "Matches",
  "r_main_ok": "Main predictions correct",
  "r_brier": "Brier score (lower = better)",
  "r_by_outcome": "Reliability by outcome",
  "r_cases": "Cases",
  "r_freq": "Happened",
  "r_gap": "Gap",
  "r_matches_an": "Matches analysed",
  "r_outcomes": "Outcomes assessed",
  "r_all_note": "Level 1: every probability calculated by the model for each analysed match, including low ones. What matters here is reliability, not hit rate: an outcome given 70% should happen about 7 times out of 10. Main prediction = most likely outcome of each market (1X2, double chance, Over/Under 1.5, Over/Under 2.5, BTTS). Brier score: 0 = perfect, 0.25 = random guessing.",
  "r_calchart": "Reliability of the probabilities",
  "r_calchart_note": "Each point groups outcomes by predicted probability. The closer the points are to the diagonal, the more reliable the probabilities.",
  "r_main_trend": "Main predictions correct over time",
  "r_by_conf": "By confidence",
  "r_by_league": "By league",
  "r_all_arch": "Match-by-match details with every probability are in the Archive.",
  "r_small": "Small sample so far: values may change a lot.",
  "r_by_version": "By model version",
  "v_a": "Model A (until 21/11)",
  "v_a73": "Model A-73 (from 22/11, minimum 73%)",
  "cmp_thr": "Above threshold – any confidence",
  "cmp_thr_lo": "Above threshold – medium or low confidence",
  "cmp_thr_hi": "Above threshold – high confidence",
  "lvn_all": "Level 1 · every probability of every analysed match.",
  "lvn_thr": "Level 2 · every outcome above its market threshold (1 and 2 ≥ 70%, X ≥ 60%, 1X/X2 ≥ 68%, 12 ≥ 72%, Over 1.5 ≥ 72%, Over 2.5 ≥ 68%, Under 2.5 ≥ 65%, BTTS yes ≥ 69%, BTTS no ≥ 66%), at any confidence.",
  "lvn_top": "Level 3 · published predictions: above threshold, high confidence and, from 22/11, probability of at least 73%."
 },
 "es": {
  "lv_all": "Todas las predicciones",
  "lv_thr": "Sobre el umbral",
  "lv_top": "Top Picks",
  "r_conf": "Confianza",
  "r_conf_all": "Todas",
  "cf_h": "Alta",
  "cf_m": "Media",
  "cf_l": "Baja",
  "r_fb_h": "⚽ Fútbol",
  "r_cmp": "Comparación de los niveles de selección",
  "r_cmp_note": "Los porcentajes solo son comparables con suficientes casos (⚠ = menos de 30) y mercados similares. Diferencia = acierto real menos probabilidad media: positiva significa que el modelo fue prudente, negativa que fue optimista.",
  "r_tn_only": "En tenis solo se registran los Top Picks (favoritos con probabilidad entre 68% y 82%).",
  "r_overview_top": "Resumen de Top Picks del periodo",
  "r_cal_tip": "Previsto de media {a}% · ocurrido {b}% · {n} casos",
  "r_matches": "Partidos",
  "r_main_ok": "Predicciones principales acertadas",
  "r_brier": "Brier score (más bajo = mejor)",
  "r_by_outcome": "Fiabilidad por resultado",
  "r_cases": "Casos",
  "r_freq": "Ocurridos",
  "r_gap": "Diferencia",
  "r_matches_an": "Partidos analizados",
  "r_outcomes": "Resultados evaluados",
  "r_all_note": "Nivel 1: todas las probabilidades calculadas por el modelo para cada partido analizado, también las bajas. Aquí importa la fiabilidad, no el porcentaje de acierto: un resultado dado al 70% debería ocurrir unas 7 veces de cada 10. Predicción principal = resultado más probable de cada mercado (1X2, doble oportunidad, Over/Under 1.5, Over/Under 2.5, ambos marcan). Brier score: 0 = perfecto, 0,25 = al azar.",
  "r_calchart": "Fiabilidad de las probabilidades",
  "r_calchart_note": "Cada punto agrupa resultados por probabilidad prevista. Cuanto más cerca de la diagonal, más fiables son las probabilidades.",
  "r_main_trend": "Predicciones principales acertadas en el tiempo",
  "r_by_conf": "Por confianza",
  "r_by_league": "Por liga",
  "r_all_arch": "El detalle partido a partido, con todas las probabilidades, está en el Archivo.",
  "r_small": "Muestra todavía pequeña: los valores pueden cambiar mucho.",
  "r_by_version": "Por versión del modelo",
  "v_a": "Model A (hasta el 21/11)",
  "v_a73": "Model A-73 (desde el 22/11, mínimo 73%)",
  "cmp_thr": "Sobre el umbral – cualquier confianza",
  "cmp_thr_lo": "Sobre el umbral – confianza media o baja",
  "cmp_thr_hi": "Sobre el umbral – confianza alta",
  "lvn_all": "Nivel 1 · todas las probabilidades de todos los partidos analizados.",
  "lvn_thr": "Nivel 2 · todos los resultados que superan el umbral de su mercado (1 y 2 ≥ 70%, X ≥ 60%, 1X/X2 ≥ 68%, 12 ≥ 72%, Over 1.5 ≥ 72%, Over 2.5 ≥ 68%, Under 2.5 ≥ 65%, ambos marcan sí ≥ 69%, no ≥ 66%), con cualquier confianza.",
  "lvn_top": "Nivel 3 · los pronósticos publicados: sobre el umbral, confianza alta y, desde el 22/11, probabilidad de al menos 73%."
 },
 "pt": {
  "lv_all": "Todas as previsões",
  "lv_thr": "Acima do limite",
  "lv_top": "Top Picks",
  "r_conf": "Confiança",
  "r_conf_all": "Todas",
  "cf_h": "Alta",
  "cf_m": "Média",
  "cf_l": "Baixa",
  "r_fb_h": "⚽ Futebol",
  "r_cmp": "Comparação dos níveis de seleção",
  "r_cmp_note": "As percentagens só são comparáveis com casos suficientes (⚠ = menos de 30) e mercados semelhantes. Diferença = acerto real menos probabilidade média: positiva significa que o modelo foi prudente, negativa que foi otimista.",
  "r_tn_only": "No tênis só são registrados os Top Picks (favoritos com probabilidade entre 68% e 82%).",
  "r_overview_top": "Resumo dos Top Picks do período",
  "r_cal_tip": "Previsto em média {a}% · aconteceu {b}% · {n} casos",
  "r_matches": "Jogos",
  "r_main_ok": "Previsões principais corretas",
  "r_brier": "Brier score (mais baixo = melhor)",
  "r_by_outcome": "Confiabilidade por resultado",
  "r_cases": "Casos",
  "r_freq": "Aconteceram",
  "r_gap": "Diferença",
  "r_matches_an": "Jogos analisados",
  "r_outcomes": "Resultados avaliados",
  "r_all_note": "Nível 1: todas as probabilidades calculadas pelo modelo para cada jogo analisado, também as baixas. Aqui importa a confiabilidade, não a taxa de acerto: um resultado dado a 70% deveria acontecer cerca de 7 vezes em 10. Previsão principal = resultado mais provável de cada mercado (1X2, dupla chance, Over/Under 1.5, Over/Under 2.5, ambas marcam). Brier score: 0 = perfeito, 0,25 = ao acaso.",
  "r_calchart": "Confiabilidade das probabilidades",
  "r_calchart_note": "Cada ponto agrupa resultados pela probabilidade prevista. Quanto mais perto da diagonal, mais confiáveis são as probabilidades.",
  "r_main_trend": "Previsões principais corretas ao longo do tempo",
  "r_by_conf": "Por confiança",
  "r_by_league": "Por campeonato",
  "r_all_arch": "O detalhe jogo a jogo, com todas as probabilidades, está no Arquivo.",
  "r_small": "Amostra ainda pequena: os valores podem mudar muito.",
  "r_by_version": "Por versão do modelo",
  "v_a": "Model A (até 21/11)",
  "v_a73": "Model A-73 (desde 22/11, mínimo 73%)",
  "cmp_thr": "Acima do limite – qualquer confiança",
  "cmp_thr_lo": "Acima do limite – confiança média ou baixa",
  "cmp_thr_hi": "Acima do limite – confiança alta",
  "lvn_all": "Nível 1 · todas as probabilidades de todos os jogos analisados.",
  "lvn_thr": "Nível 2 · todos os resultados acima do limite do seu mercado (1 e 2 ≥ 70%, X ≥ 60%, 1X/X2 ≥ 68%, 12 ≥ 72%, Over 1.5 ≥ 72%, Over 2.5 ≥ 68%, Under 2.5 ≥ 65%, ambas marcam sim ≥ 69%, não ≥ 66%), com qualquer confiança.",
  "lvn_top": "Nível 3 · os palpites publicados: acima do limite, confiança alta e, desde 22/11, probabilidade de pelo menos 73%."
 }
};
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);
(function (I) {
  var add = {"it": {"th_time": "Ora", "th_match": "Partita", "a_allpred": "Tutte le previsioni del giorno", "a_allpred_note": "Per ogni partita analizzata: tutte le probabilità calcolate prima del calcio d'inizio. Verde sottolineato = esito avvenuto · sfondo verde = sopra la soglia del mercato · ★ = Top Pick pubblicato.", "a_show": "Mostra", "a_f_all": "Tutte le partite analizzate", "a_f_thr": "Solo con selezioni sopra soglia", "a_f_top": "Solo con Top Picks", "a_league": "Campionato", "a_details": "Risultati e dettagli delle partite (marcatori, formazioni, statistiche)", "a_counts": "{n} partite registrate · {a} analizzate · {x} senza storico sufficiente · {s} selezioni sopra soglia · {t} Top Picks"}, "en": {"th_time": "Time", "th_match": "Match", "a_allpred": "All predictions of the day", "a_allpred_note": "For each analysed match: every probability calculated before kick-off. Green underline = outcome happened · green background = above the market threshold · ★ = published Top Pick.", "a_show": "Show", "a_f_all": "All analysed matches", "a_f_thr": "Only with selections above threshold", "a_f_top": "Only with Top Picks", "a_league": "League", "a_details": "Match results and details (scorers, line-ups, stats)", "a_counts": "{n} matches recorded · {a} analysed · {x} without enough history · {s} selections above threshold · {t} Top Picks"}, "es": {"th_time": "Hora", "th_match": "Partido", "a_allpred": "Todas las predicciones del día", "a_allpred_note": "Para cada partido analizado: todas las probabilidades calculadas antes del inicio. Verde subrayado = resultado ocurrido · fondo verde = sobre el umbral del mercado · ★ = Top Pick publicado.", "a_show": "Mostrar", "a_f_all": "Todos los partidos analizados", "a_f_thr": "Solo con selecciones sobre el umbral", "a_f_top": "Solo con Top Picks", "a_league": "Liga", "a_details": "Resultados y detalles de los partidos (goleadores, alineaciones, estadísticas)", "a_counts": "{n} partidos registrados · {a} analizados · {x} sin historial suficiente · {s} selecciones sobre el umbral · {t} Top Picks"}, "pt": {"th_time": "Hora", "th_match": "Jogo", "a_allpred": "Todas as previsões do dia", "a_allpred_note": "Para cada jogo analisado: todas as probabilidades calculadas antes do início. Verde sublinhado = resultado aconteceu · fundo verde = acima do limite do mercado · ★ = Top Pick publicado.", "a_show": "Mostrar", "a_f_all": "Todos os jogos analisados", "a_f_thr": "Só com seleções acima do limite", "a_f_top": "Só com Top Picks", "a_league": "Campeonato", "a_details": "Resultados e detalhes dos jogos (marcadores, escalações, estatísticas)", "a_counts": "{n} jogos registrados · {a} analisados · {x} sem histórico suficiente · {s} seleções acima do limite · {t} Top Picks"}};
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);
(function (I) {
  var add = {"it": {"st_btn": "Classifica", "st_close": "Chiudi", "st_none": "Classifica non disponibile per questo campionato.", "st_src_espn": "Fonte ESPN · aggiornata in tempo quasi reale (ritardo massimo circa 10 minuti) · ultimo aggiornamento {t}", "st_src_af": "Fonte API-Football · aggiornata ogni mattina: i risultati di oggi saranno inclusi domani · ultimo aggiornamento {t}", "st_team": "Squadra", "st_pts": "Pt", "st_pl": "G", "st_w": "V", "st_d": "N", "st_l": "P", "st_goals": "Gol", "st_gd": "DR"}, "en": {"st_btn": "Table", "st_close": "Close", "st_none": "Table not available for this league.", "st_src_espn": "Source ESPN · updated in near real time (up to about 10 minutes delay) · last update {t}", "st_src_af": "Source API-Football · updated every morning: today's results will be included tomorrow · last update {t}", "st_team": "Team", "st_pts": "Pts", "st_pl": "P", "st_w": "W", "st_d": "D", "st_l": "L", "st_goals": "Goals", "st_gd": "GD"}, "es": {"st_btn": "Clasificación", "st_close": "Cerrar", "st_none": "Clasificación no disponible para esta liga.", "st_src_espn": "Fuente ESPN · actualizada casi en tiempo real (retraso máximo de unos 10 minutos) · última actualización {t}", "st_src_af": "Fuente API-Football · actualizada cada mañana: los resultados de hoy se incluirán mañana · última actualización {t}", "st_team": "Equipo", "st_pts": "Pts", "st_pl": "PJ", "st_w": "G", "st_d": "E", "st_l": "P", "st_goals": "Goles", "st_gd": "DG"}, "pt": {"st_btn": "Classificação", "st_close": "Fechar", "st_none": "Classificação não disponível para este campeonato.", "st_src_espn": "Fonte ESPN · atualizada quase em tempo real (atraso máximo de cerca de 10 minutos) · última atualização {t}", "st_src_af": "Fonte API-Football · atualizada todas as manhãs: os resultados de hoje entram amanhã · última atualização {t}", "st_team": "Time", "st_pts": "Pts", "st_pl": "J", "st_w": "V", "st_d": "E", "st_l": "D", "st_goals": "Gols", "st_gd": "SG"}};
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);
(function (I) {
  var add = {"it": {"hero_today0": "Oggi abbiamo analizzato {n} partite e nessuna supera i nostri filtri: meglio nessun pronostico che uno debole.", "hero_today1": "Oggi abbiamo analizzato {n} partite: solo 1 supera i nostri filtri."}, "en": {"hero_today0": "Today we analysed {n} matches and none passes our filters: better no prediction than a weak one.", "hero_today1": "Today we analysed {n} matches: only 1 passes our filters."}, "es": {"hero_today0": "Hoy hemos analizado {n} partidos y ninguno supera nuestros filtros: mejor ningún pronóstico que uno débil.", "hero_today1": "Hoy hemos analizado {n} partidos: solo 1 supera nuestros filtros."}, "pt": {"hero_today0": "Hoje analisamos {n} jogos e nenhum passa nos nossos filtros: melhor nenhum palpite do que um fraco.", "hero_today1": "Hoje analisamos {n} jogos: só 1 passa nos nossos filtros."}};
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);
(function (I) {
  var add = {"it": {"hero_today": "Calcio: oggi abbiamo analizzato {n} partite, solo {k} superano i nostri filtri.", "hero_today1": "Calcio: oggi abbiamo analizzato {n} partite, solo 1 supera i nostri filtri.", "hero_today0": "Calcio: oggi abbiamo analizzato {n} partite e nessuna supera i nostri filtri: meglio nessun pronostico che uno debole.", "hero_tn": "Tennis: {k} Top Picks oggi.", "hero_tn1": "Tennis: 1 Top Pick oggi.", "hero_tn0": "Tennis: nessun Top Pick oggi.", "st_zones": "Zone"}, "en": {"hero_today": "Football: today we analysed {n} matches, only {k} pass our filters.", "hero_today1": "Football: today we analysed {n} matches, only 1 passes our filters.", "hero_today0": "Football: today we analysed {n} matches and none passes our filters: better no prediction than a weak one.", "hero_tn": "Tennis: {k} Top Picks today.", "hero_tn1": "Tennis: 1 Top Pick today.", "hero_tn0": "Tennis: no Top Picks today.", "st_zones": "Zones"}, "es": {"hero_today": "Fútbol: hoy hemos analizado {n} partidos, solo {k} superan nuestros filtros.", "hero_today1": "Fútbol: hoy hemos analizado {n} partidos, solo 1 supera nuestros filtros.", "hero_today0": "Fútbol: hoy hemos analizado {n} partidos y ninguno supera nuestros filtros: mejor ningún pronóstico que uno débil.", "hero_tn": "Tenis: {k} Top Picks hoy.", "hero_tn1": "Tenis: 1 Top Pick hoy.", "hero_tn0": "Tenis: ningún Top Pick hoy.", "st_zones": "Zonas"}, "pt": {"hero_today": "Futebol: hoje analisamos {n} jogos, só {k} passam nos nossos filtros.", "hero_today1": "Futebol: hoje analisamos {n} jogos, só 1 passa nos nossos filtros.", "hero_today0": "Futebol: hoje analisamos {n} jogos e nenhum passa nos nossos filtros: melhor nenhum palpite do que um fraco.", "hero_tn": "Tênis: {k} Top Picks hoje.", "hero_tn1": "Tênis: 1 Top Pick hoje.", "hero_tn0": "Tênis: nenhum Top Pick hoje.", "st_zones": "Zonas"}};
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);
(function (I) {
  var add = {"it": {"st_src_old": "Fonte in tempo reale momentaneamente non disponibile · mostriamo l'ultima classifica salvata ({t})"}, "en": {"st_src_old": "Live source temporarily unavailable · showing the last saved table ({t})"}, "es": {"st_src_old": "Fuente en tiempo real no disponible temporalmente · mostramos la última clasificación guardada ({t})"}, "pt": {"st_src_old": "Fonte em tempo real temporariamente indisponível · mostramos a última classificação salva ({t})"}};
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);
(function (I) {
  var add = {"it": {"st_src_old": "Classifica non aggiornata · ultimo aggiornamento il {t} · si aggiornerà automaticamente al prossimo controllo"}, "en": {"st_src_old": "Table not up to date · last updated on {t} · it will update automatically at the next check"}, "es": {"st_src_old": "Clasificación no actualizada · última actualización el {t} · se actualizará automáticamente en el próximo control"}, "pt": {"st_src_old": "Classificação não atualizada · última atualização em {t} · será atualizada automaticamente na próxima verificação"}};
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);
(function (I) {
  var add = {
    "it": {"tg_title": "Top Picks gratis su Telegram", "tg_text": "Ricevi ogni pick prima dell'inizio, gli esiti man mano e il resoconto di fine giornata. Registrazione gratuita: bastano due conferme e il tuo account Telegram.", "tg_soon": "Registrazione in arrivo a breve.", "tg_age": "Ho almeno 18 anni", "tg_priv": "Ho letto e accetto l'{l}", "tg_priv_l": "informativa privacy", "tg_btn": "Ricevi l'accesso", "tg_wait": "Un attimo…", "tg_go": "Ultimo passo: apri il bot e premi Avvia, riceverai il tuo link personale al canale.", "tg_open": "Apri Telegram", "tg_err": "Qualcosa non ha funzionato. Riprova tra poco."},
    "en": {"tg_title": "Free Top Picks on Telegram", "tg_text": "Get every pick before kick-off, results as they come in and an end-of-day summary. Free registration: two confirmations and your Telegram account.", "tg_soon": "Registration coming soon.", "tg_age": "I am at least 18 years old", "tg_priv": "I have read and accept the {l}", "tg_priv_l": "privacy notice", "tg_btn": "Get access", "tg_wait": "One moment…", "tg_go": "Last step: open the bot and press Start, you will receive your personal link to the channel.", "tg_open": "Open Telegram", "tg_err": "Something went wrong. Please try again shortly."},
    "es": {"tg_title": "Top Picks gratis en Telegram", "tg_text": "Recibe cada pick antes del inicio, los resultados al momento y el resumen del día. Registro gratuito: dos confirmaciones y tu cuenta de Telegram.", "tg_soon": "Registro disponible muy pronto.", "tg_age": "Tengo al menos 18 años", "tg_priv": "He leído y acepto la {l}", "tg_priv_l": "política de privacidad", "tg_btn": "Recibir acceso", "tg_wait": "Un momento…", "tg_go": "Último paso: abre el bot y pulsa Iniciar, recibirás tu enlace personal al canal.", "tg_open": "Abrir Telegram", "tg_err": "Algo no ha funcionado. Inténtalo de nuevo en breve."},
    "pt": {"tg_title": "Top Picks grátis no Telegram", "tg_text": "Recebe cada pick antes do início, os resultados à medida que saem e o resumo do dia. Registo gratuito: duas confirmações e a tua conta Telegram.", "tg_soon": "Registo disponível em breve.", "tg_age": "Tenho pelo menos 18 anos", "tg_priv": "Li e aceito a {l}", "tg_priv_l": "política de privacidade", "tg_btn": "Receber acesso", "tg_wait": "Um momento…", "tg_go": "Último passo: abre o bot e carrega em Iniciar, vais receber o teu link pessoal para o canal.", "tg_open": "Abrir Telegram", "tg_err": "Algo correu mal. Tenta de novo daqui a pouco."}
  };
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);
(function (I) {
  var add = {
    "it": {"min8": "Per questa partita non pubblichiamo un pronostico: lo facciamo solo quando i dati disponibili permettono una stima affidabile."},
    "en": {"min8": "We don't publish a prediction for this match: we only do so when the available data allow a reliable estimate."},
    "es": {"min8": "No publicamos un pronóstico para este partido: solo lo hacemos cuando los datos disponibles permiten una estimación fiable."},
    "pt": {"min8": "Não publicamos um palpite para este jogo: só o fazemos quando os dados disponíveis permitem uma estimativa fiável."}
  };
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);
(function (I) {
  var add = {
    "it": {"tg_join": "Unisciti al canale Telegram", "tg_text2": "Ricevi ogni pick prima dell'inizio, gli esiti man mano e il resoconto di fine giornata. Gratis."},
    "en": {"tg_join": "Join the Telegram channel", "tg_text2": "Get every pick before kick-off, results as they come in and an end-of-day summary. Free."},
    "es": {"tg_join": "Únete al canal de Telegram", "tg_text2": "Recibe cada pick antes del inicio, los resultados al momento y el resumen del día. Gratis."},
    "pt": {"tg_join": "Junta-te ao canal do Telegram", "tg_text2": "Recebe cada pick antes do início, os resultados à medida que saem e o resumo do dia. Grátis."}
  };
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);
(function (I) {
  var add = {
    "it": {"sw_fb": "Calcio", "sw_tn": "Tennis", "see_all": "Vedi tutte le partite →", "tn_all_link": "Tutte le partite di tennis →"},
    "en": {"sw_fb": "Football", "sw_tn": "Tennis", "see_all": "See all matches →", "tn_all_link": "All tennis matches →"},
    "es": {"sw_fb": "Fútbol", "sw_tn": "Tenis", "see_all": "Ver todos los partidos →", "tn_all_link": "Todos los partidos de tenis →"},
    "pt": {"sw_fb": "Futebol", "sw_tn": "Ténis", "see_all": "Ver todos os jogos →", "tn_all_link": "Todos os jogos de ténis →"}
  };
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);
(function (I) {
  var add = { "it": {"chip_tnpick": "Pronostici", "chip_tnft": "Terminate"}, "en": {"chip_tnpick": "Predictions", "chip_tnft": "Finished"}, "es": {"chip_tnpick": "Pronósticos", "chip_tnft": "Finalizados"}, "pt": {"chip_tnpick": "Palpites", "chip_tnft": "Encerrados"} };
  for (var l in add) for (var k in add[l]) I[l][k] = add[l][k];
})(window.PBP_I18N);
