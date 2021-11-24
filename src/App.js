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
  render() {

  if (this.state.error) {
    return null
  } else if (this.state.data) {
    
    return (
    <div id="display2">
    <span>
    {this.state.data.name[0].toUpperCase()}{this.state.data.name.slice(1)} first appeared in Generation {this.state.data.generation.name.split("-")[1].toUpperCase()}.
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

  render() {
    if (this.state.error) {
      return null
    } else if (this.state.data) {
      let chainData = this.state.data.chain;
      if (chainData["evolves_to"].length === 0) {
        return <div>It is not known to evolve.</div>
      } else {
        if (this.props.name===chainData.species.name) {
        return <div>{`It evolves to ${chainData["evolves_to"][0].species.name[0].toUpperCase()}${chainData["evolves_to"][0].species.name.slice(1)} `}{chainData["evolves_to"][0]["evolution_details"][0]["gender"] ? "gender"
      : chainData["evolves_to"][0]["evolution_details"][0]["held_item"] ? "held item"
      : chainData["evolves_to"][0]["evolution_details"][0]["item"] ? "item"
      : chainData["evolves_to"][0]["evolution_details"][0]["known_move"] ? `while knowing ${chainData["evolves_to"][0]["evolution_details"][0]["known_move"].name}.`
      : chainData["evolves_to"][0]["evolution_details"][0]["known_move_type"] ? "known move type"
      : chainData["evolves_to"][0]["evolution_details"][0]["location"] ? `when leveled up at ${chainData["evolves_to"][0]["evolution_details"][0]["location"].name.split("-")[0][0].toUpperCase()}${chainData["evolves_to"][0]["evolution_details"][0]["location"].name.split("-")[0].slice(1)} ${chainData["evolves_to"][0]["evolution_details"][0]["location"].name.split("-")[1][0].toUpperCase()}${chainData["evolves_to"][0]["evolution_details"][0]["location"].name.split("-")[1].slice(1)}`
      : chainData["evolves_to"][0]["evolution_details"][0]["min_affection"] ? "min affection"
      : chainData["evolves_to"][0]["evolution_details"][0]["min_beauty"] ? "min beauty"
      : chainData["evolves_to"][0]["evolution_details"][0]["min_happiness"] ? "when leveled up with high friendship."
      : chainData["evolves_to"][0]["evolution_details"][0]["needs_overworld_rain"] ? "needs overworld rain"
      : chainData["evolves_to"][0]["evolution_details"][0]["party_species"] ? "party species"
      : chainData["evolves_to"][0]["evolution_details"][0]["party_type"] ? "party type"
      : chainData["evolves_to"][0]["evolution_details"][0]["relative_physical_stats"] ? "relative physical stats"
      : chainData["evolves_to"][0]["evolution_details"][0]["time_of_day"] ? "time of day"
      : chainData["evolves_to"][0]["evolution_details"][0]["trade_species"] ? "trade species"
      : `at level ${chainData["evolves_to"][0]["evolution_details"][0]["min_level"]}.`}</div>
        } else if (chainData["evolves_to"][0]["evolves_to"].length===0) {
          return <div>{`It evolves from ${chainData.species.name[0].toUpperCase()}${chainData.species.name.slice(1)}.`}</div>
        } else if (chainData["evolves_to"][0]["evolves_to"][0].species.name===this.props.name) {
          return <div>{`It evolves from ${chainData["evolves_to"][0].species.name[0].toUpperCase()}${chainData["evolves_to"][0].species.name.slice(1)}.`}</div>
        } else if (chainData["evolves_to"][0]["evolves_to"].length!==0) {
          return <div>{`It evolves to ${chainData["evolves_to"][0]["evolves_to"][0].species.name[0].toUpperCase()}${chainData["evolves_to"][0]["evolves_to"][0].species.name.slice(1)} `}{chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["gender"] ? "gender"
          : chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["held_item"] ? "held item"
          : chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["item"] ? "item"
          : chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["known_move"] ? `while knowing ${chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["known_move"].name}.`
          : chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["known_move_type"] ? "known move type"
          : chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["location"] ? `when leveled up at ${chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["location"].name.split("-")[0][0].toUpperCase()}${chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["location"].name.split("-")[0].slice(1)} ${chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["location"].name.split("-")[1][0].toUpperCase()}${chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["location"].name.split("-")[1].slice(1)}`
          : chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["min_affection"] ? "min affection"
          : chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["min_beauty"] ? "min beauty"
          : chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["min_happiness"] ? "when leveled up with high friendship."
          : chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["needs_overworld_rain"] ? "needs overworld rain"
          : chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["party_species"] ? "party species"
          : chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["party_type"] ? "party type"
          : chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["relative_physical_stats"] ? "relative physical stats"
          : chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["time_of_day"] ? "time of day"
          : chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["trade_species"] ? "trade species"
          : `at level ${chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0]["min_level"]}.`}</div>
        } 
      }
    } else {
      return <div>...</div>
    }
  }

}





export default App;