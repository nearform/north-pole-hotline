import React from 'react'
import './Snowman.css'

function Snowman() {
  return (
    <div className="snowman">
            <div className="face">
                <div className="shadow1">
                    <div className="eyel"></div>
                    <div className="eyer"></div>
                    <div className="nose"></div>
                    <div className="hat">
                        <div className="h-top"></div>
                    </div>
                </div>
            </div>
            <div className="body">
                <div className="shadow2"></div>
                <div className="buttons">
                    <div className="b1"></div>
                    <div className="b2"></div>
                    <div className="b3"></div>
                </div>
                <div className="hand-l">
                    <div className="s1"></div>
                </div>
                <div className="hand-r">
                    <div className="s2"></div>
                </div>
            </div>
            <div className="scarf">
                <div className="sc1"></div>
                <div className="sc2"></div>
            </div>
        </div>
  )
}

export default Snowman