import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

class Cell extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDrop = this.onDrop.bind(this);
    }

    onClick(e) {
        this.props.target.toggle(this.props.id);
    }

    onDragStart(e) {
        this.props.target.start(this.props.id);
        e.dataTransfer.setData("text", this.props.id)
    }

    onDragEnd(e) {
        this.props.target.end(this.props.id);
    }

    onDragOver(e) {
        e.preventDefault();
    }

    onDrop(e) {
        this.props.target.region(e.dataTransfer.getData("text"), this.props.id)
        e.dataTransfer.clearData();
    }

    render() {
        const cell = this.props.data[this.props.id] || {};
        const style = {
            borderTopColor: cell.top ? "transparent" : "gray",
            borderRightColor: cell.right ? "transparent" : "gray",
            borderBottomColor: cell.bottom ? "transparent" : "gray",
            borderLeftColor: cell.left ? "transparent" : "gray"
        };
        return (
            <div className={cell.active ? "Cell active" : (cell.open ? "Cell open" : "Cell")}
                 draggable={true}
                 onClick={this.onClick}
                 onDragStart={this.onDragStart}
                 onDragEnd={this.onDragEnd}
                 onDragOver={this.onDragOver}
                 onDrop={this.onDrop}
                 style={style}>
                {this.props.id}
            </div>
        );
    }
}

function boxOf(Component) {
    return class extends React.Component {
        render() {
            const id = this.props.id << 2;
            return (
                <div className="Box">
                    <Component id={id + 0} target={this.props.target} data={this.props.data}/>
                    <Component id={id + 1} target={this.props.target} data={this.props.data}/>
                    <Component id={id + 2} target={this.props.target} data={this.props.data}/>
                    <Component id={id + 3} target={this.props.target} data={this.props.data}/>
                </div>
            );
        }
    }
}

class App extends Component {
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h1 className="App-title">Welcome to React</h1>
                </header>

                {this.props.children}
            </div>
        );
    }
}

export {App, Cell, boxOf};