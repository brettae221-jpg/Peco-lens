/**
 * Service for interacting with Tripo GLB API
 */

const TRIPO_API_URL = 'https://api.tripoai.com/v2/openapi/task';

export const generate3DModel = async (prompt: string): Promise<string> => {
    const apiKey = process.env.TRIPO_API_KEY || 'tcli_28c70901ebbf474e8bb11e22cb1d12f0';
    
    try {
        // Step 1: Create Task
        const createResponse = await fetch(TRIPO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                type: 'text_to_model',
                prompt: prompt,
                model_version: 'v2'
            })
        });

        const createData = await createResponse.json();
        if (!createData.data?.task_id) {
            throw new Error('Failed to create Tripo task');
        }

        const taskId = createData.data.task_id;

        // Step 2: Poll for completion (simplified for this context)
        // In a real app, we might want to use a webhook or more robust polling
        let modelUrl = '';
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const statusResponse = await fetch(`${TRIPO_API_URL}/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            const statusData = await statusResponse.json();
            
            if (statusData.data?.status === 'success') {
                modelUrl = statusData.data.output?.model;
                break;
            } else if (statusData.data?.status === 'failed') {
                throw new Error('Tripo generation failed');
            }
        }

        return modelUrl;
    } catch (error) {
        console.error('Error generating 3D model:', error);
        return ''; // Fallback to empty
    }
};
