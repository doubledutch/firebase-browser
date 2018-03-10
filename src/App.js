/*
 * Copyright 2018 DoubleDutch, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { PureComponent } from 'react'
import './App.css'

import FirebaseConnector from '@doubledutch/firebase-connector'
const extension = document.location.hash ? document.location.hash.substring(1) : ''
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

let foundData = false
extension && setTimeout(() => foundData || document.location.reload(true), 5000)

export default class App extends PureComponent {
  constructor() {
    super()
    this.state = { extension }
  }

  componentDidMount() {
    fbc.signinAdmin().then(u => this.user = u)
  }
  updateExtension = e => {
    const extension = e.target.value
    this.setState({extension})
    document.location.href = `#${extension}`
  }
  render() {
    return (
      <div>
        <header className="App-header">
          <span>sample-event-id: </span>
          <input
            type="text"
            value={this.state.extension}
            onChange={this.updateExtension}
            placeholder="extension"
            onKeyDown={e => e.keyCode === 13 && document.location.reload(true)}
          />&nbsp;
          <a href={`#${this.state.extension}`} onClick={() => document.location.reload(true)}>Update</a>
        </header>
        <div className="App-main">
          <h2>private/adminable/users <Deleter reference={adminableUsersRef}/></h2>
          <Listener reference={adminableUsersRef} />

          <h2>private/admin <Deleter reference={adminRef}/></h2>
          <Listener reference={adminRef} />

          <h2>public/users <Deleter reference={publicUsersRef}/></h2>
          <Listener reference={publicUsersRef} />

          <h2>public/admin <Deleter reference={publicAdminRef}/></h2>
          <Listener reference={publicAdminRef} />

          <h2>public/all <Deleter reference={publicAllRef}/></h2>
          <Listener reference={publicAllRef} />
        </div>
      </div>
    )
  }
}

class Deleter extends PureComponent {
  render() {
    return <button onClick={this.delete}>Delete data</button>
  }

  delete = () => {
    this.props.reference.remove()
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
        foundData = true
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