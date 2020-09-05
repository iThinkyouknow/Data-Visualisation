// largely adapted from https://observablehq.com/@d3/force-directed-graph

const drag = simulation => {
    const dragstarted = (event) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    };

    const dragged = (event) => {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    };

    const dragended = (event) => {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    };

    return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
};

const color = () => {
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    return d => scale(d.group);
};

const height = window.innerHeight;
const width = window.innerWidth;

const chart = (data) => {
    const links = data.links;
    const nodes = data.nodes;

    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2));

    const svg = d3.create('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewbox', [0, 0, width, height]);

    const link = svg.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke-width', d => Math.sqrt(d.value));

    const node = svg.append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', 5)
        .attr('fill', color())
        .call(drag(simulation));

    node.append('title')
        .text(d => d.id);

    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
    });
    return svg.node();
};

(async () => {
    const data = await d3.json('miserables.json');
    d3.select('body').append(() => chart(data));
})()