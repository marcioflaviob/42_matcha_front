import React from 'react';
import { Skeleton } from 'primereact/skeleton';
import { TIPS } from '../../components/HomePage/constants';
import TipItem from '../../components/HomePage/TipItem';

const SkeletonHomePage = () => {

    return (
        <div className='home-page-container'>
            <div className="home-header">
                <h1 className="home-title">Discover</h1>
            </div>

            <div className="home-main-content skeleton">
                        <div className="profile-card-container">
                            <div className="profile-card-skeleton" >
                                <Skeleton width="400px" height="400px" className="mb-3" borderRadius="12px" />
                                
                                <div className="profile-info-skeleton">
                                    <Skeleton width="250px" height="2rem" className="mb-2" />
                                    <Skeleton width="200px" height="1.5rem" className="mb-3" />
                                    <Skeleton width="100%" height="4rem" className="mb-3" />
                                    
                                    <div className="tags-skeleton" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <Skeleton width="80px" height="2rem" borderRadius="16px" />
                                        <Skeleton width="100px" height="2rem" borderRadius="16px" />
                                        <Skeleton width="90px" height="2rem" borderRadius="16px" />
                                    </div>
                                    
                                    <div className="buttons-skeleton" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                        <Skeleton width="120px" height="3rem" borderRadius="8px" />
                                        <Skeleton width="120px" height="3rem" borderRadius="8px" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='home-sidebar-modern'>
                            <div className='quick-stats'>
                                <div className='stat-item'>
                                    <Skeleton width="60px" height="2.5rem" className="mb-1" />
                                    <span className='stat-label'>Potential Matches</span>
                                </div>
                            </div>
                            
                            <div className='quick-tips'>
                                <h4>
                                    <i className="pi pi-lightbulb" />
                                    {' '}Tips for Better Matches
                                </h4>
                                {TIPS.map((tip, index) => (
                                    <TipItem key={index} icon={tip.icon} text={tip.text} />
                                ))}
                            </div>
                        </div>
            </div>
        </div>
    );
};

export default SkeletonHomePage;