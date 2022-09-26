import { dijkstra } from "../../../algorithms/dijkstra";
import { breadthFirstSearch } from "../../../algorithms/breadthFirstSearch.js";
import { aStar } from "../../../algorithms/astar.js";
import { useDispatch } from "react-redux";
import { setGrid, setStartOrFinish } from "../gridReducer";
import { useSelector } from "react-redux";
import { recursiveBackTrackerMaze } from "../../../algorithms/MazeAlgorithms/recursive-backtracker";
import useVisualizeGraph from "./useGraph";

export default function useVisualizeAlgo() {
  const { getNewGridWithAllWallsToggled, clearBoard } = useVisualizeGraph();
  const pathKey = useSelector((state) => state.menu.algo);
  const mazeKey = useSelector((state) => state.menu.maze);
  const nodes = useSelector((state) => state.grid.grid);

  const dispatch = useDispatch();

  const { row: startRow, col: startCol } = useSelector(
    (state) => state.grid.start
  );
  const { row: endRow, col: endCol } = useSelector(
    (state) => state.grid.finish
  );

  function getNodesInShortestPathOrder(finishNode) {
    const nodesInShortestPathOrder = [];
    let currentNode = finishNode;
    while (currentNode !== undefined) {
      nodesInShortestPathOrder.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
  }

  function animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, 10 * i);
    }
  }

  function animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 50 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, 50 * i);
    }
  }

  function animateMaze(newGrid) {
    const walls = [];
    for (let i = 0; i < newGrid.length; i++) {
      for (let j = 0; j < newGrid[i].length; j++) {
        let node = newGrid[i][j];
        if (node.isWall) {
          walls.push(node);
        }
      }
    }

    for (let x = 0; x < walls.length; x++) {
      setTimeout(() => {
        let wall = walls[x];
        document.getElementById(`node-${wall.row}-${wall.col}`).className =
          "node node-visited-wall node-wall";
      }, 5 * x);
    }

    const timeToAnimate = walls.length * 5;

    setTimeout(() => {
      dispatch(setGrid(newGrid));
    }, timeToAnimate + 400);

    return timeToAnimate + 400;
  }

  function animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
      }, 50 * i);
    }
  }

  function visualizeDjikstra() {
    const grid = nodes;
    const startNode = grid[startRow][startCol];
    const finishNode = grid[endRow][endCol];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  function visualizeAStar() {
    const grid = nodes;
    const startNode = grid[startRow][startCol];
    const finishNode = grid[endRow][endCol];
    const visitedNodesInOrder = aStar(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  function visualizeBreadthFirstSearch() {
    const grid = nodes;
    const startNode = grid[startRow][startCol];
    const finishNode = grid[endRow][endCol];
    const visitedNodesInOrder = breadthFirstSearch(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  function visualizeRecursiveDFSMaze() {
    //nodes is locked in once called? would have to reset with a function that returns a new graph ?
    const grid = getNewGridWithAllWallsToggled(nodes);
    const startNode = grid[startRow][startCol];
    const finishNode = grid[endRow][endCol];
    const newGrid = recursiveBackTrackerMaze(grid, startNode, finishNode);
    const timeToAnimate = animateMaze(newGrid);
    return timeToAnimate;
  }

  function visualizePrim() {}

  function sortAlgorithms() {
    const pathfindingAlgo =
      pathKey === "astar"
        ? visualizeAStar
        : pathKey === "dijkstra"
        ? visualizeDjikstra
        : pathKey === "breadthFirstSearch"
        ? visualizeBreadthFirstSearch()
        : "none";

    const mazeAlgo =
      mazeKey === "DFS"
        ? visualizeRecursiveDFSMaze
        : mazeKey === "prim"
        ? visualizePrim
        : "none";

    if (mazeAlgo !== "none") {
      const timeToAnimate = mazeAlgo();

      setTimeout(() => {
        pathfindingAlgo();
      }, timeToAnimate + 300);
    } else if (mazeAlgo === "none" && pathfindingAlgo !== "none") {
      pathfindingAlgo();
    } else {
      console.log("set an algorithm to begin!");
    }
  }

  function resetStartAndFinish() {
    const grid = nodes;

    const startNode = document.getElementById(`node-${startRow}-${startCol}`);
    const finishNode = document.getElementById(`node-${endRow}-${endCol}`);

    startNode.classList.remove("node-start");
    finishNode.classList.remove("node-finish");

    dispatch(setGrid());
    dispatch(setStartOrFinish(9, 10, "start"));
    dispatch(setStartOrFinish(9, 28, "finish"));

    const start = document.getElementById("node-9-10");
    const finish = document.getElementById("node-9-28");

    start.classList.add("node-start");
    finish.classList.add("node-finish");
  }

  return {
    animateShortestPath,
    getNodesInShortestPathOrder,
    animateAlgorithm,
    visualizeDjikstra,
    visualizeAStar,
    visualizeBreadthFirstSearch,
    sortAlgorithms,
    visualizeRecursiveDFSMaze,
  };
}
