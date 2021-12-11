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
    <div id="nameDiv">
      <h1 id="pokemonName">{name}</h1>
    <div id="display1">
      
      <div id="information" className="info">
        {name} is {types[0][0] === "a" ||
        types[0][0] === "e" ||
        types[0][0] === "i" ||
        types[0][0] === "o" ||
        types[0][0] === "u" ? `an ${joinedTypes}` : `a ${joinedTypes} `}
        <GenFunction species={data.data.species.url} />
        </div>
        <img src={image} alt={name} id="pokePicture" />
      
    </div>
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
    <div>
    {this.splitAndPunctuate(this.state.data.name)} first appeared in Generation {this.state.data.generation.name.split("-")[1].toUpperCase()}.
    </div>
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

  evolutionMethod = (target) => {
   return target["gender"] ? target["gender"] === 1 ? target["item"] ? `if female and exposed to the ${this.splitAndPunctuate(target["item"].name)} item.` : `if female at level ${target["min_level"]}.` : target["item"] ? `if male and exposed to the ${this.splitAndPunctuate(target["item"].name)} item.` : `if male at level ${target["min_level"]}.`
              : target["held_item"] ? target["trigger"].name === "level-up" ? target["time_of_day"] ? `when leveled up while holding the ${this.splitAndPunctuate(target["held_item"].name)} item during the ${target["time_of_day"]}.` : `when leveled up while holding the ${this.splitAndPunctuate(target["held_item"].name)} item.` : `when traded while holding the ${this.splitAndPunctuate(target["held_item"].name)} item.`
              : target["item"] ? `when exposed to the ${this.splitAndPunctuate(target["item"].name)} item.`
              : target["known_move"] ? `when leveled up while knowing ${this.splitAndPunctuate(target["known_move"].name)}.`
              : target["known_move_type"] ? target["min_affection"] ? `when leveled up while knowing any ${this.splitAndPunctuate(target["known_move_type"].name)} type move and having at least ${target["min_affection"]} levels of affection. ` : `when leveled up while having at least ${target["min_affection"]} levels of affection. `
              : target["location"] ? `when leveled up at ${this.splitAndPunctuate(target["location"].name)}.`
              : target["min_affection"] ? "min affection"
              : target["min_beauty"] ? "when leveled up with high beauty."
              : target["min_happiness"] ? target["time_of_day"] ? `when leveled up during the ${target["time_of_day"]} with high friendship.` : `when leveled up with high friendship.`
              : target["needs_overworld_rain"] ? `at level ${target["min_level"]} with rain for fog present in the overworld.`
              : target["party_species"] ? target["min_level"] ? `at level ${target["min_level"]} with a ${this.splitAndPunctuate(target["party_species"].name)} in the party.` : `while leveled up with a ${this.splitAndPunctuate(target["party_species"].name)} in the party.`
              : target["party_type"] ? target["min_level"] ? `at level ${target["min_level"]} while a ${this.splitAndPunctuate(target["party_type"].name)} type Pokémon is in the party.` : `while a ${this.splitAndPunctuate(target["party_type"].name)} type Pokémon is in the party.`
              : target["relative_physical_stats"] !== null ? target["relative_physical_stats"] === 1 ? `when its Attack value is higher than its Defense value.` : target["relative_physical_stats"] === -1 ? `when its Defense value is higher than its Attack value.` : `when its Attack and Defense values are equal.`
              : target["time_of_day"] ? `when leveled up during the ${target["time_of_day"]}.`
              : target["trade_species"] ? `when traded for a ${this.splitAndPunctuate(target["trade_species"].name)}.`
              : target["trigger"].name === "trade" ? "when traded."
              : `at level ${target["min_level"]}.`
  }

  render() {
    if (this.state.error) {
      return null
    } else if (this.state.data) {
      try {
      let chainData = this.state.data.chain;
      if (chainData["evolves_to"].length === 0) {
        //non-evolving
        return <div id="display3">{`It is not known to evolve.`}</div>
      } else {
        if (this.props.name===chainData.species.name) {
          let stageOneChain = chainData["evolves_to"][0]["evolution_details"][0];
          if (chainData["evolves_to"].length>=2) {
            //branching first stage
            if (!stageOneChain) return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)}.`}</div>
            return chainData["evolves_to"].map((branch) => {
              let branchChain = branch["evolution_details"][0]
              return <div id="display3">{`It evolves to ${this.splitAndPunctuate(branch.species.name)} `}{this.evolutionMethod(branchChain)}</div>
            })
          } else {
            //evolving first stage
            if (!stageOneChain) return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)}.`}</div>
        return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)} `}{this.evolutionMethod(stageOneChain)}</div>
        }
        } else if (chainData["evolves_to"][0]["evolves_to"].length===0) {
          //evolved second stage does not evolve
          return <div id="display3">{`It evolves from ${this.splitAndPunctuate(chainData.species.name)}.`}</div>
        } else if (chainData["evolves_to"][0]["evolves_to"][0].species.name===this.props.name) {
          //evolved third stage
          return <div id="display3">{`It evolves from ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)}.`}</div>
        } else if (chainData["evolves_to"][0]["evolves_to"][1] && chainData["evolves_to"][0]["evolves_to"][1].species.name===this.props.name) {
          //branched third stage
          return <div id="display3">{`It evolves from ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)}.`}</div>
        } else if (chainData["evolves_to"][0]["evolves_to"].length!==0) {
          //evolving second stage
          let stageTwoChain = chainData["evolves_to"][0]["evolves_to"][0]["evolution_details"][0];
          if (chainData["evolves_to"][0]["evolves_to"].length>=2) {
          //branching evolution
            return chainData["evolves_to"][0]["evolves_to"].map((branch) => {
              let branchChain = branch["evolution_details"][0]
              return <div id="display3">{`It evolves to ${this.splitAndPunctuate(branch.species.name)} `}{this.evolutionMethod(branchChain)}</div>
            })
          } else {
            if (chainData["evolves_to"][1]) {
              if (chainData["evolves_to"][0].species.name===this.props.name) {
                //first branch second stage
                return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0]["evolves_to"][0].species.name)} `}{this.evolutionMethod(stageTwoChain)}</div>
              }
              else if (chainData["evolves_to"][1].species.name===this.props.name) {
                //second branch second stage
                let stageTwoBranch = chainData["evolves_to"][1]["evolves_to"][0]["evolution_details"][0];
                return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][1]["evolves_to"][0].species.name)} `}{this.evolutionMethod(stageTwoBranch)}</div>
              }
              else if (chainData["evolves_to"][1]["evolves_to"][0].species.name===this.props.name) {
                //second branch third stage
                return <div id="display3">{`It evolves from ${this.splitAndPunctuate(chainData["evolves_to"][1].species.name)}.`}</div>
              }
              return null
          }
          return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0]["evolves_to"][0].species.name)} `}{this.evolutionMethod(stageTwoChain)}</div>
          }
        } 
      }
    } catch (err) {
      console.log(err)
      return null
    }
    } else {
      return <div id="display3">...</div>
    }
  }

}





export default App;