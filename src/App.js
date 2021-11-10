import './App.css';
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }
  searchFuncton = (e) => {
    e.preventDefault()
    let name = document.getElementById("searchInput").value;
    const getData = async () => {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon/" + name)
      const data = await res.json()
      this.setState(data)
      //console.log(this.state.sprites.front_default)
    }
    getData()
    document.getElementById("searchForm").reset();
  }
  
  render() {
  
    let nameFunction = (value) => {
      if (!value.name) {
        return null;
      } else {
        return value.name[0].toUpperCase() + value.name.substring(1);
      }
    }

    let pictureFunction = (value) => {
      if (!value.sprites) {
        return null;
      } else {
        return value.sprites.other["official-artwork"].front_default
      }
    }

    let genFunction = (value) => {
      if (!value["game_indices"]) {
        return null;
      } else {
        switch(value["game_indices"][0].version.name) {
          case "red":
          return " first appeared in Generation I."
          case "gold":
          return " first appeared in Generation II."
          case "ruby":
          return " first appeared in Generation III."
          case "diamond":
          return " first appeared in Generation IV."
          case "black":
          return " first appeared in Generation V."
          case "x":
          return " first appeared in Generation VI."
          case "sun":
          return " first appeared in Generation VII."
          case "sword":
          return " first appeared in Generation VIII."
          default:
          return null
        }
      }
    }

    let typeFunction = (value) => {
      let type = "";
      if (!value.types) {
        return null;
      }
      else if (value.types.length === 1) {
        type = value.types[0].type.name;
        if (value.types[0].type.name[0] === "a"||
            value.types[0].type.name[0] === "e"||
            value.types[0].type.name[0] === "i"||
            value.types[0].type.name[0] === "o"||
            value.types[0].type.name[0] === "u") {
          return " is an " + type + " type Pokémon. "
        } else {
          return " is a " + type + " type Pokémon. "
        }
      }
      else if (value.types.length === 2) {
        type = value.types[0].type.name + "/" + value.types[1].type.name;
        if (value.types[0].type.name[0] === "a"||
          value.types[0].type.name[0] === "e"||
          value.types[0].type.name[0] === "i"||
          value.types[0].type.name[0] === "o"||
          value.types[0].type.name[0] === "u") {
          return " is an " + type + " type Pokémon. "
        } else {
          return " is a " + type + " type Pokémon. "
        }
      }
    }
    

     

    return (
    <div className="App">
      <div id="banner">
      <h1><img src="https://fontmeme.com/permalink/211104/a930b2e32421ad097d5a5dcdedaa93f0.png" alt="pokemon-title" /></h1>
      </div>
      <div id="content">
        <form id="searchForm" onSubmit={(e)=>this.searchFuncton(e)}>
          <input id="searchInput" type="text" placeholder="search for a Pokémon here!" />
          <button id="searchButton" type="submit">Search</button>
        </form>
        <Display 
          name={nameFunction(this.state)}
          picture={pictureFunction(this.state)}
          type={typeFunction(this.state)}
          generation={genFunction(this.state)}
          />
      </div>
      <div id="footer">Pokémon and Pokémon character names are trademarks of Nintendo.</div>
    </div>
  );
}
}

class Display extends React.Component {

  render () {
    const { name, picture, type, generation} = this.props;
    
    return (
      <div id="display">
      <h1 id="pokemonName">{name}</h1>
      <p className="info">{name}{type}{name}{generation}</p>
      <img src={picture} alt={name} />
      </div>
    )
  }
}

export default App;