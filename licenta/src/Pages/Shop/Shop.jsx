import React, { useState, useEffect } from 'react';
import api from '../../api';
import './Shop.css';

const Shop = () => {
    const [prizes, setPrizes] = useState([]);
    const [userCoins, setUserCoins] = useState(0);
    const [loading, setLoading] = useState(true);
    const user_id = localStorage.getItem("user_id");
    const [myPrizes, setMyPrizes] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prizesRes, statsRes, myPrizesRes] = await Promise.all([
                api.get('/prizes'),
                api.get(`/user_stats/${user_id}`),
                api.get('/prizes/my')
            ]);
            setPrizes(prizesRes.data);
            setUserCoins(statsRes.data.w_coins);
            setMyPrizes(myPrizesRes.data);
        } catch (error) {
            console.error("Error fetching shop data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBuy = async (prizeId, cost) => {
        if (userCoins < cost) {
            alert("Insufficient W-Coins! Complete more tasks to earn more.");
            return;
        }
        if (window.confirm("Confirm purchase?")) {
            try {
                await api.post(`/prizes/buy/${prizeId}`);
                alert("Purchase successful! Check your inventory.");
                fetchData();
            } catch (error) {
                alert(error.response?.data?.error || "Purchase failed");
            }
        }
    };

    const ShopCard = ({ prize, onBuy }) => (
        <div className='shop_card'>
            <div className="shop_flex_row">
                <span className="material-symbols-outlined shop_icon">{prize.icon}</span>
            </div>
            <h4 className="shop_name">{prize.name}</h4>
            <p className="shop_description_text">{prize.description}</p>
            <div className="shop_price">
                {prize.cost} WC
            </div>
            <button className="shop_btn" onClick={() => onBuy(prize.prize_id, prize.cost)}>
                ACQUIRE
            </button>
        </div>
    );

    const ShopSection = ({ title, icon, prizes, onBuy }) => {
        if (prizes.length === 0) return null;
        return (
            <section className='shop_section'>
                <div className="shop_section_header">
                    <div className="shop_title_group">
                        <span className="material-symbols-outlined">{icon}</span>
                        <h3 className="shop_section_title">{title}</h3>
                    </div>
                    <div className="shop_header_line"></div>
                </div>
                <div className="shop_grid">
                    {prizes.map(prize => (
                        <ShopCard key={prize.prize_id} prize={prize} onBuy={onBuy} />
                    ))}
                </div>
            </section>
        );
    };

    const InventoryCard = ({ item }) => (
        <div className={`inventory_card ${item.status.toLowerCase()}`}>
            <div className="inv_header">
                <span className="material-symbols-outlined inv_icon">{item.Nom_Prize?.icon}</span>
                <div className="inv_info">
                    <h4 className="inv_name">{item.Nom_Prize?.name}</h4>
                    <span className="status_badge">{item.status}</span>
                </div>
            </div>
            <div className="inv_details">
                {item.uses_left !== null && (
                    <div className="inv_stat">
                        <span className="label">Remaining:</span>
                        <span className="value">{item.uses_left} uses</span>
                    </div>
                )}
                {item.expiry_date && (
                    <div className="inv_stat">
                        <span className="label">Expires:</span>
                        <span className="value">{new Date(item.expiry_date).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </div>
    );




    if (loading) return <div className="shop_loading">Accessing Black Market...</div>;

    return (
        <div className="shop_main">
            <div className='shop_header_wrapper'>
                <div className='shop_header_flex'>
                    <div className="shop_header_title">
                        <span className="shop_tagline">Exchange W-COINS for PRIZES in</span>
                        <h2 className="shop_title">
                            THE <span className="shop_gradient_text">SHOP</span>
                        </h2>
                        <p className="shop_description">
                            Syncro's Rewards Hub. Convert your hard-earned credits (W-Coins) into workplace advantages, tactical XP overclocks, and exclusive cosmetic protocols.
                        </p>
                    </div>
                    <div className="shop_balance_container">
                        <div className="shop_balance_group">
                            <span className="shop_balance_label">Available Balance</span>
                            <div className="shop_balance_value_row">
                                <span className="shop_balance_amount">
                                    {userCoins || '0'} <span className="shop_text_primary">W-COINS</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ShopSection
                title="Vouchers"
                icon="confirmation_number"
                prizes={prizes.filter(p => p.type === 'VOUCHER')}
                onBuy={handleBuy}
            />
            <ShopSection
                title="Power-Ups"
                icon="bolt"
                prizes={prizes.filter(p => p.type === 'BOOSTER')}
                onBuy={handleBuy}
            />
            <ShopSection
                title="Custom Style Items"
                icon="palette"
                prizes={prizes.filter(p => p.type === 'STYLE')}
                onBuy={handleBuy}
            />

            <section className='shop_section inventory_section'>
                <div className="shop_section_header">
                    <div className="shop_title_group">
                        <span className="material-symbols-outlined">inventory_2</span>
                        <h3 className="shop_section_title">Inventory</h3>
                    </div>
                    <div className="shop_header_line"></div>
                </div>

                <div className="inventory_grid">
                    {myPrizes.length === 0 ? (
                        <div className="empty_inventory">
                            <p>No items in your inventory.</p>
                        </div>
                    ) : (
                        myPrizes.map(item => (
                            <InventoryCard key={item.purchase_id} item={item} />
                        ))
                    )}
                </div>
            </section>


            {/* ------------------------ */}
            {/* <div className="shop_header">
                <h1>REWARD TERMINAL</h1>
                <div className="coin_balance">
                    <span className="material-symbols-outlined">monetization_on</span>
                    {userCoins} W-COINS
                </div>
            </div>
            <section className="shop_category">
                <h2><span className="material-symbols-outlined">confirmation_number</span> OFFICE VOUCHERS</h2>
                <div className="prizes_grid">
                    {prizes.filter(p => p.type === 'VOUCHER').map(prize => (
                        <PrizeCard key={prize.prize_id} prize={prize} onBuy={handleBuy} />
                    ))}
                </div>
            </section>
            <section className="shop_category">
                <h2><span className="material-symbols-outlined">bolt</span> POWER-UPS & BOOSTERS</h2>
                <div className="prizes_grid">
                    {prizes.filter(p => p.type === 'BOOSTER').map(prize => (
                        <PrizeCard key={prize.prize_id} prize={prize} onBuy={handleBuy} />
                    ))}
                </div>
            </section>
            <section className="shop_category">
                <h2><span className="material-symbols-outlined">palette</span> COSMETICS & STYLE</h2>
                <div className="prizes_grid">
                    {prizes.filter(p => p.type === 'STYLE').map(prize => (
                        <PrizeCard key={prize.prize_id} prize={prize} onBuy={handleBuy} />
                    ))}
                </div>
            </section>
            <div className="inventory_section">
                <h2><span className="material-symbols-outlined">inventory_2</span> MY INVENTORY</h2>
                <div className="inventory_grid">
                    {myPrizes.length === 0 ? (
                        <p className="no_items">No items purchased yet.</p>
                    ) : (
                        myPrizes.map(item => (
                            <div key={item.purchase_id} className={`inventory_card ${item.status.toLowerCase()}`}>
                                <div className="inv_header">
                                    <span className="material-symbols-outlined">{item.Nom_Prize?.icon}</span>
                                    <span>{item.Nom_Prize?.name}</span>
                                </div>
                                <div className="inv_details">
                                    {item.uses_left !== null && <p>Uses left: {item.uses_left}</p>}
                                    {item.expiry_date && <p>Expires: {new Date(item.expiry_date).toLocaleDateString()}</p>}
                                    <span className="status_label">{item.status}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div> */}
        </div>
    );
}

export default Shop;