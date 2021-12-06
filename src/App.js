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
  render() {
    if (this.state.error) {
      return null
    } else if (this.state.data) {
      try {
      let chainData = this.state.data.chain;
      if (chainData["evolves_to"].length === 0) {
        //non-evolving
        return <div id="display3">It is not known to evolve.</div>
      } else {
        if (this.props.name===chainData.species.name) {
          let stageOneChain = chainData["evolves_to"][0]["evolution_details"][0];
          if (chainData["evolves_to"].length>=2) {
            //branching evolution
            return chainData["evolves_to"].map((branch) => {
              let branchChain = branch["evolution_details"][0]
              return <div>{`It evolves to ${this.splitAndPunctuate(branch.species.name)} `}{branchChain["gender"] ? branchChain["gender"] === 1 ? branchChain["item"] ? `if female and exposed to the ${this.splitAndPunctuate(branchChain["item"].name)} item.` : `when female at level ${branchChain["min_level"]}.` : branchChain["item"] ? `if male and exposed to the ${this.splitAndPunctuate(branchChain["item"].name)} item.` : `when male at level ${branchChain["min_level"]}.`
              : branchChain["held_item"] ? branchChain["trigger"].name === "level-up" ? branchChain["time_of_day"] ? `when leveled up while holding the ${this.splitAndPunctuate(branchChain["held_item"].name)} item during the ${branchChain["time_of_day"]}.` : `when leveled up while holding the ${this.splitAndPunctuate(branchChain["held_item"].name)} item.` : `when traded while holding the ${this.splitAndPunctuate(branchChain["held_item"].name)} item.`
              : branchChain["item"] ? `when exposed to the ${this.splitAndPunctuate(branchChain["item"].name)} item.`
              : branchChain["known_move"] ? `while knowing ${this.splitAndPunctuate(branchChain["known_move"].name)}.`
              : branchChain["known_move_type"] ? branchChain["min_affection"] ? `when leveled up while knowing any ${this.splitAndPunctuate(branchChain["known_move_type"].name)} type move and having at least ${branchChain["min_affection"]} levels of affection. ` : `when leveled up while having at least ${branchChain["min_affection"]} levels of affection. `
              : branchChain["location"] ? `when leveled up at ${this.splitAndPunctuate(branchChain["location"].name)}.`
              : branchChain["min_affection"] ? "min affection"
              : branchChain["min_beauty"] ? "when leveled up with high beauty."
              : branchChain["min_happiness"] ? branchChain["time_of_day"] ? `when leveled up during the ${branchChain["time_of_day"]} with high friendship.` : `when leveled up with high friendship.`
              : branchChain["needs_overworld_rain"] ? `at level ${branchChain["min_level"]} with rain for fog present in the overworld.`
              : branchChain["party_species"] ? branchChain["min_level"] ? `at level ${branchChain["min_level"]} with a ${this.splitAndPunctuate(branchChain["party_species"].name)} in the party.` : `while leveled up with a ${this.splitAndPunctuate(branchChain["party_species"].name)} in the party.`
              : branchChain["party_type"] ? branchChain["min_level"] ? `at level ${branchChain["min_level"]} while a ${this.splitAndPunctuate(branchChain["party_type"].name)} type Pokémon is in the party.` : `while a ${this.splitAndPunctuate(branchChain["party_type"].name)} type Pokémon is in the party.`
              : branchChain["relative_physical_stats"] !== null ? branchChain["relative_physical_stats"] === 1 ? `when its Attack value is higher than its Defense value.` : branchChain["relative_physical_stats"] === -1 ? `when its Defense value is higher than its Attack value.` : `when its Attack and Defense values are equal.`
              : branchChain["time_of_day"] ? "time of day"
              : branchChain["trade_species"] ? `when traded for a ${this.splitAndPunctuate(branchChain["trade_species"].name)}.`
              : branchChain["trigger"].name === "trade" ? "when traded."
              : `at level ${branchChain["min_level"]}.`}</div>
            })
          } else {
            //evolving first stage
        return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)} `}{stageOneChain["gender"] ? stageOneChain["gender"] === 1 ? stageOneChain["item"] ? `if female and exposed to the ${this.splitAndPunctuate(stageOneChain["item"].name)} item.` : `when female at level ${stageOneChain["min_level"]}.` : stageOneChain["item"] ? `if male and exposed to the ${this.splitAndPunctuate(stageOneChain["item"].name)} item.` : `when male at level ${stageOneChain["min_level"]}.`
      : stageOneChain["held_item"] ? stageOneChain["trigger"].name === "level-up" ? stageOneChain["time_of_day"] ? `when leveled up while holding the ${this.splitAndPunctuate(stageOneChain["held_item"].name)} item during the ${stageOneChain["time_of_day"]}.` : `when leveled up while holding the ${this.splitAndPunctuate(stageOneChain["held_item"].name)} item.` : `when traded while holding the ${this.splitAndPunctuate(stageOneChain["held_item"].name)} item.`
      : stageOneChain["item"] ? `when exposed to the ${this.splitAndPunctuate(stageOneChain["item"].name)} item.`
      : stageOneChain["known_move"] ? `while knowing ${this.splitAndPunctuate(stageOneChain["known_move"].name)}.`
      : stageOneChain["known_move_type"] ? "known move type"
      : stageOneChain["location"] ? `when leveled up at ${this.splitAndPunctuate(stageOneChain["location"].name)}.`
      : stageOneChain["min_affection"] ? "min affection"
      : stageOneChain["min_beauty"] ? "when leveled up with high beauty."
      : stageOneChain["min_happiness"] ? stageOneChain["time_of_day"] ? `when leveled up during the ${stageOneChain["time_of_day"]} with high friendship.` : `when leveled up with high friendship.`
      : stageOneChain["needs_overworld_rain"] ? `at level ${stageOneChain["min_level"]} with rain for fog present in the overworld.`
      : stageOneChain["party_species"] ? stageOneChain["min_level"] ? `at level ${stageOneChain["min_level"]} with a ${this.splitAndPunctuate(stageOneChain["party_species"].name)} in the party.` : `while leveled up with a ${this.splitAndPunctuate(stageOneChain["party_species"].name)} in the party.`
      : stageOneChain["party_type"] ? stageOneChain["min_level"] ? `at level ${stageOneChain["min_level"]} while a ${this.splitAndPunctuate(stageOneChain["party_type"].name)} type Pokémon is in the party.` : `while a ${this.splitAndPunctuate(stageOneChain["party_type"].name)} type Pokémon is in the party.`
      : stageOneChain["relative_physical_stats"] !== null ? stageOneChain["relative_physical_stats"] === 1 ? `when its Attack value is higher than its Defense value.` : stageOneChain["relative_physical_stats"] === -1 ? `when its Defense value is higher than its Attack value.` : `when its Attack and Defense values are equal.`
      : stageOneChain["time_of_day"] ? "time of day"
      : stageOneChain["trade_species"] ? `when traded for a ${this.splitAndPunctuate(stageOneChain["trade_species"].name)}.`
      : stageOneChain["trigger"].name === "trade" ? "when traded."
      : `at level ${stageOneChain["min_level"]}.`}</div>
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
            /*branching evolution*/
            return chainData["evolves_to"][0]["evolves_to"].map((branch) => {
              let branchChain = branch["evolution_details"][0]
              return <div>{`It evolves to ${this.splitAndPunctuate(branch.species.name)} `}{branchChain["gender"] ? branchChain["gender"] === 1 ? branchChain["item"] ? `if female and exposed to the ${this.splitAndPunctuate(branchChain["item"].name)} item.` : `when female at level ${branchChain["min_level"]}.` : branchChain["item"] ? `if male and exposed to the ${this.splitAndPunctuate(branchChain["item"].name)} item.` : `when male at level ${branchChain["min_level"]}.`
              : branchChain["held_item"] ? branchChain["trigger"].name === "level-up" ? branchChain["time_of_day"] ? `when leveled up while holding the ${this.splitAndPunctuate(branchChain["held_item"].name)} item during the ${branchChain["time_of_day"]}.` : `when leveled up while holding the ${this.splitAndPunctuate(branchChain["held_item"].name)} item.` : `when traded while holding the ${this.splitAndPunctuate(branchChain["held_item"].name)} item.`
              : branchChain["item"] ? `when exposed to the ${this.splitAndPunctuate(branchChain["item"].name)} item.`
              : branchChain["known_move"] ? `while knowing ${this.splitAndPunctuate(branchChain["known_move"].name)}.`
              : branchChain["known_move_type"] ? branchChain["min_affection"] ? `when leveled up while knowing any ${this.splitAndPunctuate(branchChain["known_move_type"].name)} type move and having at least ${branchChain["min_affection"]} levels of affection. ` : `when leveled up while having at least ${branchChain["min_affection"]} levels of affection. `
              : branchChain["location"] ? `when leveled up at ${this.splitAndPunctuate(branchChain["location"].name)}.`
              : branchChain["min_affection"] ? "min affection"
              : branchChain["min_beauty"] ? "when leveled up with high beauty."
              : branchChain["min_happiness"] ? branchChain["time_of_day"] ? `when leveled up during the ${branchChain["time_of_day"]} with high friendship.` : `when leveled up with high friendship.`
              : branchChain["needs_overworld_rain"] ? `at level ${branchChain["min_level"]} with rain for fog present in the overworld.`
              : branchChain["party_species"] ? branchChain["min_level"] ? `at level ${branchChain["min_level"]} with a ${this.splitAndPunctuate(branchChain["party_species"].name)} in the party.` : `while leveled up with a ${this.splitAndPunctuate(branchChain["party_species"].name)} in the party.`
              : branchChain["party_type"] ? branchChain["min_level"] ? `at level ${branchChain["min_level"]} while a ${this.splitAndPunctuate(branchChain["party_type"].name)} type Pokémon is in the party.` : `while a ${this.splitAndPunctuate(branchChain["party_type"].name)} type Pokémon is in the party.`
              : branchChain["relative_physical_stats"] !== null ? branchChain["relative_physical_stats"] === 1 ? `when its Attack value is higher than its Defense value.` : branchChain["relative_physical_stats"] === -1 ? `when its Defense value is higher than its Attack value.` : `when its Attack and Defense values are equal.`
              : branchChain["time_of_day"] ? "time of day"
              : branchChain["trade_species"] ? `when traded for a ${this.splitAndPunctuate(branchChain["trade_species"].name)}.`
              : branchChain["trigger"].name === "trade" ? "when traded."
              : `at level ${branchChain["min_level"]}.`}</div>
            })
          } else {
            if (chainData["evolves_to"][1]) {

              if (chainData["evolves_to"][0].species.name===this.props.name) {
                //first branch second stage
                return <div>{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0]["evolves_to"][0].species.name)} `}{stageTwoChain["gender"] ? stageTwoChain["gender"] === 1 ? stageTwoChain["item"] ? `if female and exposed to the ${this.splitAndPunctuate(stageTwoChain["item"].name)} item.` : `when female at level ${stageTwoChain["min_level"]}.` : stageTwoChain["item"] ? `if male and exposed to the ${this.splitAndPunctuate(stageTwoChain["item"].name)} item.` : `when male at level ${stageTwoChain["min_level"]}.`
              : stageTwoChain["held_item"] ? stageTwoChain["trigger"].name === "level-up" ? stageTwoChain["time_of_day"] ? `when leveled up while holding the ${this.splitAndPunctuate(stageTwoChain["held_item"].name)} item during the ${stageTwoChain["time_of_day"]}.` : `when leveled up while holding the ${this.splitAndPunctuate(stageTwoChain["held_item"].name)} item.` : `when traded while holding the ${this.splitAndPunctuate(stageTwoChain["held_item"].name)} item.`
              : stageTwoChain["item"] ? `when exposed to the ${this.splitAndPunctuate(stageTwoChain["item"].name)} item.`
              : stageTwoChain["known_move"] ? `while knowing ${this.splitAndPunctuate(stageTwoChain["known_move"].name)}.`
              : stageTwoChain["known_move_type"] ? stageTwoChain["min_affection"] ? `when leveled up while knowing any ${this.splitAndPunctuate(stageTwoChain["known_move_type"].name)} type move and having at least ${stageTwoChain["min_affection"]} levels of affection. ` : `when leveled up while having at least ${stageTwoChain["min_affection"]} levels of affection. `
              : stageTwoChain["location"] ? `when leveled up at ${this.splitAndPunctuate(stageTwoChain["location"].name)}.`
              : stageTwoChain["min_affection"] ? "min affection"
              : stageTwoChain["min_beauty"] ? "when leveled up with high beauty."
              : stageTwoChain["min_happiness"] ? stageTwoChain["time_of_day"] ? `when leveled up during the ${stageTwoChain["time_of_day"]} with high friendship.` : `when leveled up with high friendship.`
              : stageTwoChain["needs_overworld_rain"] ? `at level ${stageTwoChain["min_level"]} with rain for fog present in the overworld.`
              : stageTwoChain["party_species"] ? stageTwoChain["min_level"] ? `at level ${stageTwoChain["min_level"]} with a ${this.splitAndPunctuate(stageTwoChain["party_species"].name)} in the party.` : `while leveled up with a ${this.splitAndPunctuate(stageTwoChain["party_species"].name)} in the party.`
              : stageTwoChain["party_type"] ? stageTwoChain["min_level"] ? `at level ${stageTwoChain["min_level"]} while a ${this.splitAndPunctuate(stageTwoChain["party_type"].name)} type Pokémon is in the party.` : `while a ${this.splitAndPunctuate(stageTwoChain["party_type"].name)} type Pokémon is in the party.`
              : stageTwoChain["relative_physical_stats"] !== null ? stageTwoChain["relative_physical_stats"] === 1 ? `when its Attack value is higher than its Defense value.` : stageTwoChain["relative_physical_stats"] === -1 ? `when its Defense value is higher than its Attack value.` : `when its Attack and Defense values are equal.`
              : stageTwoChain["time_of_day"] ? "time of day"
              : stageTwoChain["trade_species"] ? `when traded for a ${this.splitAndPunctuate(stageTwoChain["trade_species"].name)}.`
              : stageTwoChain["trigger"].name === "trade" ? "when traded."
              : `at level ${stageTwoChain["min_level"]}.`}</div>
              }
              else if (chainData["evolves_to"][1].species.name===this.props.name) {
                //second branch second stage
                let stageTwoBranch = chainData["evolves_to"][1]["evolves_to"][0]["evolution_details"][0];
                return <div>{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][1]["evolves_to"][0].species.name)} `}{stageTwoBranch["gender"] ? stageTwoBranch["gender"] === 1 ? stageTwoBranch["item"] ? `if female and exposed to the ${this.splitAndPunctuate(stageTwoBranch["item"].name)} item.` : `when female at level ${stageTwoBranch["min_level"]}.` : stageTwoBranch["item"] ? `if male and exposed to the ${this.splitAndPunctuate(stageTwoBranch["item"].name)} item.` : `when male at level ${stageTwoBranch["min_level"]}.`
              : stageTwoBranch["held_item"] ? stageTwoBranch["trigger"].name === "level-up" ? stageTwoBranch["time_of_day"] ? `when leveled up while holding the ${this.splitAndPunctuate(stageTwoBranch["held_item"].name)} item during the ${stageTwoBranch["time_of_day"]}.` : `when leveled up while holding the ${this.splitAndPunctuate(stageTwoBranch["held_item"].name)} item.` : `when traded while holding the ${this.splitAndPunctuate(stageTwoBranch["held_item"].name)} item.`
              : stageTwoBranch["item"] ? `when exposed to the ${this.splitAndPunctuate(stageTwoBranch["item"].name)} item.`
              : stageTwoBranch["known_move"] ? `while knowing ${this.splitAndPunctuate(stageTwoBranch["known_move"].name)}.`
              : stageTwoBranch["known_move_type"] ? stageTwoBranch["min_affection"] ? `when leveled up while knowing any ${this.splitAndPunctuate(stageTwoBranch["known_move_type"].name)} type move and having at least ${stageTwoBranch["min_affection"]} levels of affection. ` : `when leveled up while having at least ${stageTwoBranch["min_affection"]} levels of affection. `
              : stageTwoBranch["location"] ? `when leveled up at ${this.splitAndPunctuate(stageTwoBranch["location"].name)}.`
              : stageTwoBranch["min_affection"] ? "min affection"
              : stageTwoBranch["min_beauty"] ? "when leveled up with high beauty."
              : stageTwoBranch["min_happiness"] ? stageTwoBranch["time_of_day"] ? `when leveled up during the ${stageTwoBranch["time_of_day"]} with high friendship.` : `when leveled up with high friendship.`
              : stageTwoBranch["needs_overworld_rain"] ? `at level ${stageTwoBranch["min_level"]} with rain for fog present in the overworld.`
              : stageTwoBranch["party_species"] ? stageTwoBranch["min_level"] ? `at level ${stageTwoBranch["min_level"]} with a ${this.splitAndPunctuate(stageTwoBranch["party_species"].name)} in the party.` : `while leveled up with a ${this.splitAndPunctuate(stageTwoBranch["party_species"].name)} in the party.`
              : stageTwoBranch["party_type"] ? stageTwoBranch["min_level"] ? `at level ${stageTwoBranch["min_level"]} while a ${this.splitAndPunctuate(stageTwoBranch["party_type"].name)} type Pokémon is in the party.` : `while a ${this.splitAndPunctuate(stageTwoBranch["party_type"].name)} type Pokémon is in the party.`
              : stageTwoBranch["relative_physical_stats"] !== null ? stageTwoBranch["relative_physical_stats"] === 1 ? `when its Attack value is higher than its Defense value.` : stageTwoBranch["relative_physical_stats"] === -1 ? `when its Defense value is higher than its Attack value.` : `when its Attack and Defense values are equal.`
              : stageTwoBranch["time_of_day"] ? "time of day"
              : stageTwoBranch["trade_species"] ? `when traded for a ${this.splitAndPunctuate(stageTwoBranch["trade_species"].name)}.`
              : stageTwoBranch["trigger"].name === "trade" ? "when traded."
              : `at level ${stageTwoBranch["min_level"]}.`}</div>
              }
              else if (chainData["evolves_to"][1]["evolves_to"][0].species.name===this.props.name) {
                //second branch third stage
                return <div id="display3">{`It evolves from ${this.splitAndPunctuate(chainData["evolves_to"][1].species.name)}.`}</div>
              }
              return <div>unresolved double branch</div>
          }
          return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0]["evolves_to"][0].species.name)} `}{stageTwoChain["gender"] ? stageTwoChain["gender"] === 1 ? stageTwoChain["item"] ? `if female and exposed to the ${this.splitAndPunctuate(stageTwoChain["item"].name)} item.` : `when female at level ${stageTwoChain["min_level"]}.` : stageTwoChain["item"] ? `if male and exposed to the ${this.splitAndPunctuate(stageTwoChain["item"].name)} item.` : `when male at level ${stageTwoChain["min_level"]}.`
          : stageTwoChain["held_item"] ? stageTwoChain["trigger"].name === "level-up" ? stageTwoChain["time_of_day"] ? `when leveled up while holding the ${this.splitAndPunctuate(stageTwoChain["held_item"].name)} item during the ${stageTwoChain["time_of_day"]}.` : `when leveled up while holding the ${this.splitAndPunctuate(stageTwoChain["held_item"].name)} item.` : `when traded while holding the ${this.splitAndPunctuate(stageTwoChain["held_item"].name)} item.`
          : stageTwoChain["item"] ? `when exposed to the ${this.splitAndPunctuate(stageTwoChain["item"].name)} item.`
          : stageTwoChain["known_move"] ? `while knowing ${this.splitAndPunctuate(stageTwoChain["known_move"].name)}.`
          : stageTwoChain["known_move_type"] ? "known move type"
          : stageTwoChain["location"] ? `when leveled up at ${this.splitAndPunctuate(stageTwoChain["location"].name)}.`
          : stageTwoChain["min_affection"] ? "min affection"
          : stageTwoChain["min_beauty"] ? "when leveled up with high beauty."
          : stageTwoChain["min_happiness"] ? stageTwoChain["time_of_day"] ? `when leveled up during the ${stageTwoChain["time_of_day"]} with high friendship.` : `when leveled up with high friendship.`
          : stageTwoChain["needs_overworld_rain"] ? `at level ${stageTwoChain["min_level"]} with rain for fog present in the overworld.`
          : stageTwoChain["party_species"] ? stageTwoChain["min_level"] ? `at level ${stageTwoChain["min_level"]} with a ${this.splitAndPunctuate(stageTwoChain["party_species"].name)} in the party.` : `while leveled up with a ${this.splitAndPunctuate(stageTwoChain["party_species"].name)} in the party.`
          : stageTwoChain["party_type"] ? stageTwoChain["min_level"] ? `at level ${stageTwoChain["min_level"]} while a ${this.splitAndPunctuate(stageTwoChain["party_type"].name)} type Pokémon is in the party.` : `while a ${this.splitAndPunctuate(stageTwoChain["party_type"].name)} type Pokémon is in the party.`
          : stageTwoChain["relative_physical_stats"] !== null ? stageTwoChain["relative_physical_stats"] === 1 ? `when its Attack value is higher than its Defense value.` : stageTwoChain["relative_physical_stats"] === -1 ? `when its Defense value is higher than its Attack value.` : `when its Attack and Defense values are equal.`
          : stageTwoChain["time_of_day"] ? "time of day"
          : stageTwoChain["trade_species"] ? `when traded for a ${this.splitAndPunctuate(stageTwoChain["trade_species"].name)}.`
          : stageTwoChain["trigger"].name === "trade" ? "when traded."
          : `at level ${stageTwoChain["min_level"]}.`}</div>
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