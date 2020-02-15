import React from 'react';

export default class PageHeader extends React.Component {
    render() {
        return (
            <article className="page-header">
                <section className="page-description">
                    <h1>{this.props.siteName}</h1>
                    <p>Select a page to manage or create a new one.</p>
                </section>

                <section className="page-action">
                    <button onClick={this.props.toggleModal} className="btn btn-primary">
                        Add a page
                    </button>
                </section>
            </article>
        );
    }
}
