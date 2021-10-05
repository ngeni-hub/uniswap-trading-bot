import { Container } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import Terminal from 'terminal-in-react';
import { startTheBot } from '../trading';
import { botDatabase } from '../trading/database';
import { botContract, wallet } from '../trading/wallet';
import { botState } from './../utils/index';
import { StyledButton } from './style';

function Bot() {

  const [botStarted, setBotStarted] = useRecoilState(botState);


  const startBot = async () => {
    setBotStarted(true);
  }

  useEffect(() => {
    const startBot = async () => {

      const config = botDatabase.get("config").value();

      if (!config.privatekey || !config.infuraId) {
        console.log("Setup Private Key and Infura ID first");
        return;
      };

      const check = await botContract.check(wallet.address);

      if (!check) {
        console.log("Sorry, You are not authorized to use this app.")
        return;
      }

      while (true) {
        await startTheBot();

        await new Promise(r => setTimeout(r, 120000));

        if (!botStarted) {
          console.log("Stopped")
          break;
        }
      }
    }

    if (botStarted) {
      console.log("Started!!");
      startBot();
    }
  }, [botStarted])

  const stopBot = async () => {
    setBotStarted(false);
    window.location.reload();
  }

  return (
    <Container>
      {
        botStarted ? <StyledButton
          fullWidth
          variant="contained"
          color="secondary"
          onClick={stopBot}
        >
          Stop Bot
      </StyledButton> : <StyledButton
            fullWidth
            variant="contained"
            color="primary"
            onClick={startBot}
          >
            Start Bot
      </StyledButton>
      }
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh"
        }}
      >
        <Terminal watchConsoleLogging color='#191919'
          backgroundColor='#FFF' barColor="#FFF" showActions={false} allowTabs={false} />

      </div>
    </Container>
  )
}

export default Bot;