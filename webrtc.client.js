let dataChannel  = null;
let interval = null;

function onMessage({ data }) {
    console.log( "data");
    if (data === 'pong') {
      console.log('received pong');
    }
  }

function onDataChannel({ channel }) {
    console.log( "Is there a channel?" );
  if (channel.label !== 'ping-pong') {
      console.log( "Not a ping-pong channel");
    return;
  }

  dataChannel = channel;
  dataChannel.addEventListener('message', onMessage);

  interval = setInterval(() => {
    console.log('sending ping');
    dataChannel.send('ping');
  }, 1000);
}

async function createConnectio()
{
    console.log( "Creating connection" );
    const response = await fetch("connection").then( response => response.json());
    console.log( "setting remote description" );

    const localPeerConnection = new RTCPeerConnection({
      sdpSemantics: 'unified-plan'
    });


    await localPeerConnection.setRemoteDescription( response.offer );

    console.log( "adds event listening" );
    localPeerConnection.addEventListener('datachannel', onDataChannel);

    console.log( "Create answer!" );
    const answer = await localPeerConnection.createAnswer();

    console.log( "setting localDescription");
    await localPeerConnection.setLocalDescription(answer);
    
    await fetch( `connection/${response.id}`,
    { 
        method: "POST", 
        body: JSON.stringify( localPeerConnection.localDescription ), 
        headers: { 'Content-Type': 'application/json'}
    });

    setTimeout(() => {
        console.log( localPeerConnection.connectionState );
        console.log( localPeerConnection );
    }, 2000)
}

createConnectio();