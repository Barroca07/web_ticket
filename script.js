const PADRAO = {
  contadores: { SP: 2026, SG: 5521, SE: 1189 },
  fila: { SP: [], SG: [], SE: [] },
  emitidas: 0,
  painelHistorico: [],
  guiches: {
    "01": { atendidas: 0, chamando: "Aguardando..." },
    "03": { atendidas: 0, chamando: "Aguardando..." }
  }
};

const loadState = () =>
  JSON.parse(localStorage.getItem("atendimentoState")) || PADRAO;

const saveState = (state) =>
  localStorage.setItem("atendimentoState", JSON.stringify(state));

function App() {
  const [state, setState] = React.useState(loadState());

  const atualizar = (novo) => {
    setState(novo);
    saveState(novo);
  };

  const emitirSenha = (tipo, guicheDefault) => {
    const novo = { ...state };
    novo.contadores[tipo]++;
    novo.emitidas++;
    const senha = `${tipo}-${novo.contadores[tipo]}`;
    novo.fila[tipo].push(senha);
    novo.ultimaSenha = `${senha} (Sugestão: ${guicheDefault})`;
    atualizar(novo);
  };

  const chamar = (id) => {
    const novo = { ...state };
    const g = novo.guiches[id];

    if (g.ocupado) return alert(`O Guichê ${id} está ocupado!`);

    let tipo = null;
    if (novo.fila.SP.length) tipo = "SP";
    else if (novo.fila.SG.length) tipo = "SG";
    else if (novo.fila.SE.length) tipo = "SE";

    if (!tipo) {
      g.chamando = "Aguardando...";
      atualizar(novo);
      return alert("Não há senhas!");
    }

    const senha = novo.fila[tipo].shift();
    g.atendidas++;
    g.chamando = `${senha} • Guichê ${id}`;
    g.ocupado = true;
    novo.ultimaChamada = g.chamando;
    novo.painelHistorico.unshift({ senha, guiche: id });
    if (novo.painelHistorico.length > 6) novo.painelHistorico.pop();

    atualizar(novo);

    setTimeout(() => {
      const finish = { ...novo };
      finish.guiches[id].ocupado = false;
      atualizar(finish);
    }, 3000);
  };

  return (
    <>
      <div className="container">
        {/* TOTEM */}
        <div className="box">
          <h2>Totem de Senhas</h2>
          <button className="sp" onClick={() => emitirSenha("SP", "03")}>Emitir Prioritária (SP)</button>
          <button className="sg" onClick={() => emitirSenha("SG", "02")}>Emitir Geral (SG)</button>
          <button className="se" onClick={() => emitirSenha("SE", "01")}>Emitir Exames (SE)</button>
          <p className="mt-3"><strong>Última senha:</strong><br />{state.ultimaSenha || "---"}</p>
          <div className="stats">
            <p>Fila SP: {state.fila.SP.length} | SG: {state.fila.SG.length} | SE: {state.fila.SE.length}</p>
            <p>Total Emitidas: {state.emitidas}</p>
          </div>
        </div>

        {/* GUICHÊS */}
        {Object.keys(state.guiches).map(id => (
          <div className="box" key={id}>
            <h2>Guichê {id}</h2>
            <p>Status: 
              <span style={{ color: state.guiches[id].ocupado ? "red" : "green", fontWeight: "bold" }}>
                {state.guiches[id].ocupado ? " Ocupado" : " Livre"}
              </span>
            </p>
            <button className="call" onClick={() => chamar(id)}>Chamar Próximo</button>
            <p className="mt-3">Chamando:<br /><strong>{state.guiches[id].chamando}</strong></p>
            <p>Atendidas: {state.guiches[id].atendidas}</p>
          </div>
        ))}
      </div>

      {/* PAINEL PRINCIPAL */}
      <div className="painel-centro container mt-4">
        <h2>Painel Principal</h2>
        <div className="ultima-senha">
          {state.ultimaChamada || "Aguardando..."}
        </div>
        <h3>Histórico</h3>
        <div className="lista-senhas">
          {state.painelHistorico.map((item, index) => (
            <div className="painel-item" key={index}>
              {item.senha} - Guichê <strong>{item.guiche}</strong>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));