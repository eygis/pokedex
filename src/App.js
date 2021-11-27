import './App.css';
import React from 'react';

class App extends React.Component {
    state = {
      searchTarget: "",
      requested: false
    }
  
  handleChange = (e) => {
    this.setState({
      searchTarget: e.target.value,
      requested: false
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({requested: true})
  }

  render() {
    return (
      <div className="App">
      <div id="banner">
      <h1><img src="https://fontmeme.com/permalink/211104/a930b2e32421ad097d5a5dcdedaa93f0.png" alt="pokemon-title" /></h1>
      </div>
      <div id="content">
        <form id="searchForm" onSubmit={this.handleSubmit}>
          <input id="searchInput" type="text" placeholder="search for a Pokémon here!" onChange={this.handleChange} />
          <button id="searchButton" type="submit">Search</button>
        </form>
        {this.state.requested && (<SearchReturn targetPokemon={this.state.searchTarget} />)}
      </div>
      <div id="footer">Pokémon and Pokémon character names are trademarks of Nintendo.</div>
    </div>
    )
  }
}

class SearchReturn extends React.Component {
  state = {
    data: null,
    error: false,
    loading: false
  };

  async componentDidMount() {
    const pokemon = this.props.targetPokemon.toLowerCase();
    const pokemonEndpoint = `https://pokeapi.co/api/v2/pokemon/${pokemon}`;
    this.setState({loading: true})
    try {
      const res = await fetch(pokemonEndpoint);
      const data = await res.json();
      this.setState({data, loading: false})
    } catch (err) {
      this.setState({
        error: true,
        loading: false
      })
    }
    document.getElementById("searchForm").reset();
  }

  render() {
    if (this.state.error) {
      return "Pokémon not found."
    } else if (this.state.loading) {
      return "Loading..."
    } else if (this.state.data) {
      return <NameAndPicture data={this.state.data} />
    } else {
      return null
    }
  }

}

let NameAndPicture = (data) => {
  const name = `${data.data.name[0].toUpperCase()}${data.data.name.slice(1)}`;
  const types = data.data.types.map(type => `${type.type.name[0].toUpperCase()}${type.type.name.slice(1)}`);
  const joinedTypes = types.join("/") + " type Pokémon."
  const image = data.data.sprites.other["official-artwork"].front_default;
  return (
    <div id="display1">
      <h1 id="pokemonName">{name}</h1>
      <span id="information" className="info">
        {name} is {types[0][0] === "a" ||
        types[0][0] === "e" ||
        types[0][0] === "i" ||
        types[0][0] === "o" ||
        types[0][0] === "u" ? `an ${joinedTypes}` : `a ${joinedTypes} `}
        <GenFunction species={data.data.species.url} />
        <img src={image} alt={name} id="pokePicture" />
      </span>
    </div>
  )
}

class GenFunction extends React.Component {
  state = {
    data: null,
    error: false,
  }
  
  async componentDidMount() {
    try {
      const res = await fetch(this.props.species);
      const data = await res.json();
      this.setState({data: data})
    } catch (err) {
      this.setState({error: true})
      console.log(err)
    }
  }

  splitAndPunctuate = (target) => {
    let fixed = target.split("-").map(i => i[0].toUpperCase() + i.slice(1)).join(" ")
    return fixed
  }

  render() {

  if (this.state.error) {
    return null
  } else if (this.state.data) {
    
    return (
    <div id="display2">
    <span>
    {this.splitAndPunctuate(this.state.data.name)} first appeared in Generation {this.state.data.generation.name.split("-")[1].toUpperCase()}.
    </span>
    <EvolutionChain name={this.state.data.name} chainUrl={this.state.data["evolution_chain"].url} />
    </div>
  )
  } else {
    return "..."
  }
}
}

class EvolutionChain extends React.Component {
  state = {
    data: null,
    error: false,
  }

  async componentDidMount() {
    try {
      const res = await fetch(this.props.chainUrl);
      const data = await res.json();
      this.setState({data: data})
    } catch (err) {
      this.setState({error: true})
      console.log(err)
    }
  }
  splitAndPunctuate = (target) => {
    let fixed = target.split("-").map(i => i[0].toUpperCase() + i.slice(1)).join(" ")
    return fixed
  }
  render() {
    if (this.state.error) {
      return null
    } else if (this.state.data) {
      try {
      let chainData = this.state.data.chain;
      if (chainData["evolves_to"].length === 0) {
        return <div>It is not known to evolve.</div>
      } else {
        if (this.props.name===chainData.species.name) {
          let stageOneChain = chainData["evolves_to"][0]["evolution_details"][0];
        return <div>{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)} `}{stageOneChain["gender"] ? "gender"
      : stageOneChain["held_item"] ? stageOneChain["trigger"].name === "level-up" ? stageOneChain["time_of_day"] ? `when leveled up while holding the ${this.splitAndPunctuate(stageOneChain["held_item"].name)} item during the ${stageOneChain["time_of_day"]}.` : `when leveled up while holding the ${this.splitAndPunctuate(stageOneChain["held_item"].name)} item.` : `when traded while holding the ${this.splitAndPunctuate(stageOneChain["held_item"].name)} item.`
      : stageOneChain["item"] ? `when exposed to the ${this.splitAndPunctuate(stageOneChain["item"].name)} item.`
      : stageOneChain["known_move"] ? `while knowing ${this.splitAndPunctuate(stageOneChain["known_move"].name)}.`
      : stageOneChain["known_move_type"] ? "known move type"
      : stageOneChain["location"] ? `when leveled up at ${this.splitAndPunctuate(stageOneChain["location"].name)}.`
      : stageOneChain["min_affection"] ? "min affection"
      : stageOneChain["min_beauty"] ? "when leveled up with high beauty."
      : stageOneChain["min_happiness"] ? "when leveled up with high friendship."
      : stageOneChain["needs_overworld_rain"] ? `at level ${stageOneChain["min_level"]} with rain for fog present in the overworld.`
      : stageOneChain["party_species"] ? stageOneChain["min_level"] ? `at level ${stageOneChain["min_level"]} with a ${this.splitAndPunctuate(stageOneChain["party_species"].name)} in the party.` : `while leveled up with a ${this.splitAndPunctuate(stageOneChain["party_species"].name)} in the party.`
      : stageOneChain["party_type"] ? stageOneChain["min_level"] ? `at level ${stageOneChain["min_level"]} while a ${this.splitAndPunctuate(stageOneChain["party_type"].name)} type Pokémon is in the party.` : `while a ${this.splitAndPunctuate(stageOneChain["party_type"].name)} type Pokémon is in the party.`
      : stageOneChain["relative_physical_stats"] ? "relative physical stats"
      : stageOneChain["time_of_day"] ? "time of day"
      : stageOneChain["trade_species"] ? `when traded for a ${this.splitAndPunctuate(stageOneChain["trade_species"].name)}.`
      : stageOneChain["trigger"].name === "trade" ? "when traded."
      : `at level ${stageOneChain["min_level"]}.`}</div>
        } else if (chainData["evolves_to"][0]["evolves_to"].length===0) {
          return <div>{`It evolves from ${this.splitAndPunctuate(chainData.species.name)}.`}</div>
        } else if (chainData["evolves_to"][0]["evolves_to"][0].species.name===this.props.name) {
          return <div>{`It evolves from ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)}.`}</div>
        } else if (chainData["evolves_to"][0]["evolves_to"].length!==0) {
          let stageTwoChain = chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0];
          return <div>{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0]["evolves_to"][0].species.name)} `}{stageTwoChain["gender"] ? "gender"
          : stageTwoChain["held_item"] ? stageTwoChain["trigger"].name === "level-up" ? stageTwoChain["time_of_day"] ? `when leveled up while holding the ${this.splitAndPunctuate(stageTwoChain["held_item"].name)} item during the ${stageTwoChain["time_of_day"]}.` : `when leveled up while holding the ${this.splitAndPunctuate(stageTwoChain["held_item"].name)} item.` : `when traded while holding the ${this.splitAndPunctuate(stageTwoChain["held_item"].name)} item.`
          : stageTwoChain["item"] ? `when exposed to the ${this.splitAndPunctuate(stageTwoChain["item"].name)} item.`
          : stageTwoChain["known_move"] ? `while knowing ${this.splitAndPunctuate(stageTwoChain["known_move"].name)}.`
          : stageTwoChain["known_move_type"] ? "known move type"
          : stageTwoChain["location"] ? `when leveled up at ${this.splitAndPunctuate(stageTwoChain["location"].name)}.`
          : stageTwoChain["min_affection"] ? "min affection"
          : stageTwoChain["min_beauty"] ? "when leveled up with high beauty."
          : stageTwoChain["min_happiness"] ? "when leveled up with high friendship."
          : stageTwoChain["needs_overworld_rain"] ? `at level ${stageTwoChain["min_level"]} with rain for fog present in the overworld.`
          : stageTwoChain["party_species"] ? stageTwoChain["min_level"] ? `at level ${stageTwoChain["min_level"]} with a ${this.splitAndPunctuate(stageTwoChain["party_species"].name)} in the party.` : `while leveled up with a ${this.splitAndPunctuate(stageTwoChain["party_species"].name)} in the party.`
          : stageTwoChain["party_type"] ? stageTwoChain["min_level"] ? `at level ${stageTwoChain["min_level"]} while a ${this.splitAndPunctuate(stageTwoChain["party_type"].name)} type Pokémon is in the party.` : `while a ${this.splitAndPunctuate(stageTwoChain["party_type"].name)} type Pokémon is in the party.`
          : stageTwoChain["relative_physical_stats"] ? "relative physical stats"
          : stageTwoChain["time_of_day"] ? "time of day"
          : stageTwoChain["trade_species"] ? `when traded for a ${this.splitAndPunctuate(stageTwoChain["trade_species"].name)}.`
          : stageTwoChain["trigger"].name === "trade" ? "when traded."
          : `at level ${stageTwoChain["min_level"]}.`}</div>
        } 
      }
    } catch (err) {
      return null
      console.log(err)
    }
    } else {
      return <div>...</div>
    }
  }

}





export default App;