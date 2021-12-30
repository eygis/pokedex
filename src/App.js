import './App.css';
import React, {useState} from 'react';
import defense_type_effectiveness from './defense_type_effectiveness.json'
let typesList = defense_type_effectiveness;

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
    document.getElementById("tip").style.opacity = "100%"
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({requested: true})
    document.getElementById("tip").style.opacity = "0%"
  }

  render() {
    return (
      <div className="App">
      <div id="banner">
      <h1><img src="https://fontmeme.com/permalink/211104/a930b2e32421ad097d5a5dcdedaa93f0.png" alt="pokemon-title" id="pokemon-title"/></h1>
      </div>
      <div id="content">
        <form id="searchForm" onSubmit={this.handleSubmit}>
          <input id="searchInput" type="text" placeholder="search for a Pokémon here!" onChange={this.handleChange} required />
          <button id="searchButton" type="submit">Search</button>
        </form>
        {this.state.requested && (<SearchReturn targetPokemon={this.state.searchTarget} />)}
      </div>
      <p id="tip">TIP: If the pokemon you're searching for is a specific form or variant, search using that variant or form's name, for example: "muk-alola" or "lycanroc-dusk"
</p>
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
      return <ContentDisplay data={this.state.data} />
    } else {
      return null
    }
  }

}

let ContentDisplay = (data) => {
  const name = `${data.data.name[0].toUpperCase()}${data.data.name.slice(1)}`;
  const image = data.data.sprites.other["official-artwork"].front_default;
  const [currentDisplay, setDisplay] = useState(<GenFunction priorData={data} species={data.data.species.url} />)
  return (
    <div id="nameDiv">
      <h1 id="pokemonName">{name}</h1>
    <div id="display1">

      <div id="information" className="info">
        <div id="tabBar">
          <div className="tab" onClick={()=>setDisplay(<GenFunction priorData={data} species={data.data.species.url} />)}>Basic Information</div>
          <div className="tab" onClick={()=>setDisplay(<GameData passedData={data} />)}>Game Data</div>
        </div>
        {currentDisplay}
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
  const priorData = this.props.priorData;
  const name = `${priorData.data.name[0].toUpperCase()}${priorData.data.name.slice(1)}`;
  const types = priorData.data.types.map(type => `${type.type.name[0].toUpperCase()}${type.type.name.slice(1)}`);
  const joinedTypes = types.join("/") + " type Pokémon."

  if (this.state.error) {
    return null
  } else if (this.state.data) {
    
    return (
    <div id="display2">
    <div>{name} is {types[0][0] === "A" ||
        types[0][0] === "E" ||
        types[0][0] === "I" ||
        types[0][0] === "O" ||
        types[0][0] === "U" ? `an ${joinedTypes}` : `a ${joinedTypes} `}
        </div>
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

let GameData = (passedData) => {
  let data = passedData.passedData.data
  let capitalize = (target) => {
    let capitalized;
    capitalized = target[0].toUpperCase() + target.slice(1);
    if (capitalized.includes("-")) {
      capitalized = capitalized.split("-").map(i => i[0].toUpperCase() + i.slice(1)).join(" ")
    }
    if (capitalized.length===2) {
      capitalized = capitalized.split("").map(i => i[0].toUpperCase()).join("")
    }
    return capitalized
  }

  let pokemonTypes = data.types.map((type)=>type.type.name)
  let weaknessCalc = (targetTypes) => {
    let weaknesses  = {}

    targetTypes.forEach((type) => {
      let target = typesList[type];
      let weak = target.weak;
      let resistant = target.resistant;
      let immune = target.immune;
      weak.forEach((type)=>{
        if (weaknesses.hasOwnProperty(type)) {
          weaknesses[type] = weaknesses[type] * 2;
          if (weaknesses[type]===1) {
            delete weaknesses[type]
          }
        } else {
          weaknesses[type] = 2;
        }
      })
      resistant.forEach((type)=>{
        if (weaknesses.hasOwnProperty(type)) {
          weaknesses[type] = weaknesses[type] * .5;
          if (weaknesses[type]===1) {
            delete weaknesses[type]
          }
        } else {
          weaknesses[type] = .5;
        }
      })
      immune.forEach((type)=>{
        if (weaknesses.hasOwnProperty(type)) {
          weaknesses[type] = weaknesses[type] * 0;
          if (weaknesses[type]===1) {
            delete weaknesses[type]
          }
        } else {
          weaknesses[type] = 0;
        }
      })
    })
    
    return weaknesses
  }
    let entries = Object.entries(weaknessCalc(pokemonTypes))
    entries.sort(([a, b],[c, d]) => d - b)
    let weaknessMap = entries.map((element) => {
      return <div key={element} id="weaknessMap"><span className={element[0]}>{`${capitalize(element[0])}`}</span>-type damage is {element[1]}x. </div>
    })

    let hiddenDisplay = (passedAbility) => {
      return (!passedAbility["is_hidden"]) ? passedAbility.ability.name : `${passedAbility.ability.name} (Hidden Ability)`
    }

    const [currentAbility, setAbility] = useState()

    let abilityFunction = async (abilityName) => {
      try {
        setAbility("Loading...")
        const res = await fetch(`https://pokeapi.co/api/v2/ability/${abilityName}/`);
        const data = await res.json();
        if (!data) {
          setAbility(null)
        } else if (data) {
          if (data["effect_entries"].length>=1) {
         if (data["effect_entries"][0].language.name==="en") {
           setAbility(data["effect_entries"][0]["short_effect"])
         } else {  
        setAbility(data["effect_entries"][1]["short_effect"])
         }
        } else if (data["flavor_text_entries"].length>=1) {
          setAbility(data["flavor_text_entries"][0]["flavor_text"])
        }
        } else {
          setAbility(null)
        }
      } catch (err) {
        setAbility("Information Unavailable.")
      }
    }
    

    let statTotal = (data) => {
      let total = 0;
      data.stats.forEach(stat=>{
        total+=stat["base_stat"]
      })
      return total
    }

    return (
     <div>
       <h2>Defensive Type Effectiveness</h2>
       {weaknessMap}
       <p>All other damage types are 1x.</p>
       <h2>Abilities</h2>
       {data.abilities.map(ability=>{
        return <p className="tooltip" key={ability.ability.name} onMouseEnter={()=>abilityFunction(ability.ability.name)}>{capitalize(hiddenDisplay(ability))}
        <span className="tooltipText">{currentAbility}</span>
        </p>
       })}
       <h2>Base Stats</h2>
       <table id="statsTable" className="statsTable">
       <tbody>
       {data.stats.map(stat=>{
         return <tr key={stat.stat.name}>
           <td className="statsTable">{capitalize(stat.stat.name)}</td>
           <td className="statsTable">{stat["base_stat"]}</td>
           </tr>
       })}
       <tr>
       <td>Total</td>
       <td>{statTotal(data)}</td>
       </tr>
       </tbody>
       </table>
       </div>
      
    )
  
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

  evolutionMethod = (baseChain, target) => {
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
              : target["trigger"].name === "shed" ? `as well if the player has a spare slot in the party and an extra Poké Ball when evolving to ${this.splitAndPunctuate(baseChain["evolves_to"][0].species.name)}. `
              : target["turn_upside_down"] ? `at level ${target["min_level"]} while the game system is held upside-down. `
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
            if (chainData.species.name==="applin") return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)} when exposed to the Tart Apple item, and to ${this.splitAndPunctuate(chainData["evolves_to"][1].species.name)} when exposed to the Sweet Apple item.`}</div>
            if (chainData.species.name==="yamask") return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)} at level ${stageOneChain["min_level"]}, or if of the Galarian regional variant to ${this.splitAndPunctuate(chainData["evolves_to"][1].species.name)} when the player travels under the stone bridge in Dusty Bowl after Yamask takes at least 49 HP in damage without fainting.`}</div>
            return chainData["evolves_to"].map((branch) => {
              let branchChain = branch["evolution_details"][0]
              return <div id="display3">{`It evolves to ${this.splitAndPunctuate(branch.species.name)} `}{this.evolutionMethod(chainData, branchChain)}</div>
            })
          } else {
            //evolving first stage
            if (chainData.species.name==="meltan") return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)} when given a total of 400 Meltan Candy in in Pokémon Go.`}</div>
            if (chainData.species.name==="sinistea") return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)} when exposed to the Cracked Pot or Chipped Pot items.`}</div>
            if (chainData.species.name==="farfetchd") return <div id="display3">{`If of the Galarian regional variant, it evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)} after landing three critical hits in a single battle. `}</div>
            if (chainData.species.name==="milcery") return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)} if holding a Sweet item when its trainer spins and strikes a pose. The form it evolves into depends on time of day, the length of the spin, and whether the trainer was spinning clockwise or counterclockwise. `}</div>
            if (chainData.species.name==="kubfu") return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)} Single Strike Style when trained in the Tower of Darkness, and to ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)} Rapid Strike Style when trained in the Tower of Waters.`}</div>
        return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0].species.name)} `}{this.evolutionMethod(chainData, stageOneChain)}</div>
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
              return <div id="display3">{`It evolves to ${this.splitAndPunctuate(branch.species.name)} `}{this.evolutionMethod(chainData, branchChain)}</div>
            })
          } else {
            if (chainData["evolves_to"][1]) {
              if (chainData["evolves_to"][0].species.name===this.props.name) {
                //first branch second stage
                return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0]["evolves_to"][0].species.name)} `}{this.evolutionMethod(chainData, stageTwoChain)}</div>
              }
              else if (chainData["evolves_to"][1].species.name===this.props.name) {
                //second branch second stage
                let stageTwoBranch = chainData["evolves_to"][1]["evolves_to"][0]["evolution_details"][0];
                return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][1]["evolves_to"][0].species.name)} `}{this.evolutionMethod(chainData, stageTwoBranch)}</div>
              }
              else if (chainData["evolves_to"][1]["evolves_to"][0].species.name===this.props.name) {
                //second branch third stage
                return <div id="display3">{`It evolves from ${this.splitAndPunctuate(chainData["evolves_to"][1].species.name)}.`}</div>
              }
              return null
          }
          return <div id="display3">{`It evolves to ${this.splitAndPunctuate(chainData["evolves_to"][0]["evolves_to"][0].species.name)} `}{this.evolutionMethod(chainData, stageTwoChain)}</div>
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