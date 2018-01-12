import React, { PureComponent } from 'react'
import './App.css'

import FirebaseConnector from '@doubledutch/firebase-connector'
const queryString = require('query-string')
const {extension} = queryString.parse(document.location.search)
const client = {
  currentEvent: {id: 'sample-event-id'},
  region: 'none',
  getToken() {
    return Promise.resolve('fake-access-token')
  }
}
const fbc = new FirebaseConnector(client, extension)
fbc.initializeAppWithSimpleBackend()

const adminableUsersRef = fbc.database.private.adminableUsersRef()
const adminRef = fbc.database.private.adminRef()
const publicUsersRef = fbc.database.public.usersRef()
const publicAdminRef = fbc.database.public.adminRef()
const publicAllRef = fbc.database.public.allRef()

export default class App extends PureComponent {
  constructor() {
    super()
  }

  componentDidMount() {
    fbc.signinAdmin().then(u => this.user = u)
  }
  render() {
    return (
      <div>
        <header className="App-header">
          <h1 className="App-title">{extension}</h1>
        </header>
        <div className="App-main">
          <h2>private/adminable/users</h2>
          <Listener reference={adminableUsersRef} />

          <h2>private/admin</h2>
          <Listener reference={adminRef} />

          <h2>public/users</h2>
          <Listener reference={publicUsersRef} />

          <h2>public/admin</h2>
          <Listener reference={publicAdminRef} />

          <h2>public/all</h2>
          <Listener reference={publicAllRef} />
        </div>
      </div>
    )
  }
}

class Listener extends PureComponent {
  constructor() {
    super()
    this.state = {}
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.reference !== nextProps.reference) {
      if (this.props.reference) this.props.reference.off('value')
      this.listen(nextProps.reference)
    }
  }

  componentDidMount() {
    const {reference} = this.props
    this.listen(reference)
  }

  listen(reference) {
    if (reference) {
      reference.on('value', data => {
        this.setState({data: data.val()})
      })
    }
  }

  render() {
    return (
      <Node data={this.state.data} />
    )
  }
}

class Node extends PureComponent {
  constructor() {
    super()
    this.state = { expanded: false }
  }

  render() {
    const {data} = this.props
    const {expanded} = this.state
    if (data === null) return <code className="Node">null</code>
    if (typeof data === 'object') {
      return (
        <div className="Node">
          <button onClick={this.toggle}>{this.state.expanded ? '-' : '+'}</button>
          { expanded
            ? <ul>{Object.keys(data).map(k => <li key={k}><code>{k}: </code><Node data={data[k]} /></li>)}</ul>
            : <code>{JSON.stringify(data)}</code>
          }
        </div>
      )
    }
    return <code className="Node">{JSON.stringify(data)}</code>
  }

  toggle = () => this.setState({expanded: !this.state.expanded})
}