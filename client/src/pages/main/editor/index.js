import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';

import Layout from 'components/layout';
import MainEditor from './components/MainEditor';
import BlockPicker from './components/BlockPicker';
import { GET_PAGE, SAVE_BLOCKS } from './graphql';

import './style.scss';
import { toast } from 'react-toastify';

/* === Utils === */
function formatContents(contents) {
    return contents.map((content) => ({
        id: content.id,
        type: content.type,
        name: content.name || '',
        slug: content.slug || '',
        content: content.content || '',
        ref: React.createRef()
    }));
}

function formatContentsForSave(contents) {
    return contents.map((content) => ({
        type: content.type,
        name: content.name,
        slug: content.slug,
        content: content.content
    }));
}

/* === Custom Hooks ==== */

function useDataFetch() {
    const { pageid, siteid } = useParams();
    const queryResponse = useQuery(GET_PAGE, {
        variables: { pageid, siteid }
    });

    return queryResponse;
}

function useSave(blocks) {
    const [saveBlocks] = useMutation(SAVE_BLOCKS);
    const { pageid, siteid } = useParams();

    return {
        saveBlocks: async () => {
            // call mutation function
            try {
                await saveBlocks({
                    variables: {
                        pageid,
                        siteid,
                        blocks: formatContentsForSave(blocks)
                    }
                });
            } catch (e) {
                toast.error('Error saving. Make sure all required fields are set');
            }
        }
    };
}

function useBlocks(queryResponse) {
    const [blocks, updateBlockState] = useState([]);
    const { data } = queryResponse;

    useEffect(() => {
        if (data) {
            // strip out unused GQL details
            const formattedContents = formatContents(data.page.contents);
            updateBlockState(formattedContents);
        }
    }, [data]);

    useEffect(() => {
        // scroll to the newly added item
        const lastBlock = blocks[blocks.length - 1];
        if (lastBlock?.name.length === 0) {
            lastBlock.ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [blocks]);

    const addBlock = (blockType) => {
        const ref = React.createRef();

        const block = {
            // use a random ID until item is saved
            id: `${Math.floor(Math.random() * 1000)}`,
            type: blockType,
            name: '',
            slug: '',
            content: '',
            ref
        };

        updateBlockState(blocks.concat([block]));
    };

    const removeBlock = (blockId) => {
        updateBlockState(blocks.filter((block) => block.id !== blockId));
    };

    const updateBlock = (blockId, blockField, fieldValue) => {
        updateBlockState(
            blocks.map((block) => {
                if (block.id === blockId) {
                    return Object.assign({}, block, { [blockField]: fieldValue });
                }
                return block;
            })
        );
    };

    return {
        blocks,
        addBlock,
        removeBlock,
        updateBlock
    };
}

export default function EditorHooks() {
    const queryResponse = useDataFetch();
    const { blocks, addBlock, removeBlock, updateBlock } = useBlocks(queryResponse);
    const { saveBlocks } = useSave(blocks);

    return (
        <Layout>
            <main className="editor-page">
                <section className="main-section">
                    <header className="page-header">
                        <h1>Home</h1>
                    </header>

                    {/* main editor */}
                    <MainEditor
                        blocks={blocks}
                        removeBlock={removeBlock}
                        updateBlock={updateBlock}
                        response={queryResponse}
                    />
                </section>

                <aside className="block-picker-section">
                    <BlockPicker addBlock={addBlock} saveBlocks={saveBlocks} />
                </aside>
            </main>
        </Layout>
    );
}
