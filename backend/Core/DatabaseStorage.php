<?php

/**
 * Created by PhpStorm.
 * User: clovis
 * Date: 15/02/17
 * Time: 15:10
 */

include_once 'Storage.php';

foreach (glob("./../Model/*.php") as $filename)
{
    include_once $filename;
}


class DatabaseStorage implements Storage
{
    private $pdo;
    private $objects;
    private $index;

    function __construct($host, $database, $username, $password)
    {
        $this->pdo = new PDO("mysql:host=".$host.";dbname=".$database, $username, $password);
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->exec("SET names 'utf8';");
        $this->objects = array();
        $this->index = 0;
    }

    /**
     * Récupère tout les objects de la table class en lien avec l'instance object et place cette liste dans destination
     * @param $class string en lien avec object dans laquelle chercher des liens
     * @param $object StorageItem depuis lequel chercher des liens
     * @param $destination array dans laquelle sotcker les résultats
     * @param $condition string Condition SQL a appliquer a la requete
     * @return mixed
     */
    public function findAllRelated($class, &$object, &$destination, $condition="")
    {
        $sql = "SELECT * from ".$class." WHERE ".get_class($object)."_id=:id";
        if($condition != "")
            $sql = $sql." ".$condition;
        $data = array();
        $data[":id"] = $object->id;
        $request = $this->pdo->prepare($sql);
        $results = $request->execute($data);
        if($results != true)
            throw new Exception("An error occured while retrieving from database.");
        $results = $request->fetchAll();
        $related = array();
        foreach ($results as $result)
        {
            $inst = new $class($this);
            foreach ($inst as $key => $value) {
                if (is_array($value) == false)
                    $inst->$key = $result[$key];

            }
            $this->persist($inst, StorageState::UpToDate);
            array_push($related, $inst);
        }
        $destination = $related;
    }

    /**
     * Récupère un object possédant un id dans la base de données
     * @param $object StorageItem initialisé disposant d'un ID prédéfini
     * @return mixed l'objet possédant toutes ses données ou NULL si n'existe pas dans la persistence
     */
    public function find(&$object)
    {
        if($object->id == NULL || !isset($object->id))
            throw new Exception("Searched object musts have an Id.");
        if(isset($this->objects[get_class($object)][$object->id])) {
            $object = $this->objects[get_class($object)][$object->id];
            return $this->objects[get_class($object)][$object->id];
        }
        $sql = "SELECT * from :table WHERE id=:id";
        $data = array();
        $data[":id"] = $object->id;
        $sql = str_replace(":table", get_class($object), $sql);
        $request = $this->pdo->prepare($sql);
        $results = $request->execute($data);
        if($results != true)
            throw new Exception("An error occured while retrieving from database.");
        $results = $request->fetchAll();
        if(count($results) < 1)
            return NULL;
        else if(count($results) > 1)
            throw new Exception("Your database is inconsistent. Multiple entries have same id. Please correct it.");
        $results = $results[0];
        foreach ($object as $key => $value) {
            if (is_array($value) == false)
                $object->$key = $results[$key];

        }
        $this->persist($object, StorageState::UpToDate);
        return $object;
    }

    /**
     * Marque un objet à supprimer  dela base de données
     * @param $object StorageItem objet possédnant un id à supprimer de la persistence
     * @return mixed
     */
    public function remove(&$object)
    {
        if(isset($this->objects[get_class($object)]) && isset($this->objects[get_class($object)][$object->id])) {
            //print "change state<br>";
            $this->objects[get_class($object)][$object->id]->setState(StorageState::ToDelete);
            //print $object->State()."<br>";
        }
        else {
            $this->persist($object, StorageState::ToDelete);
        }
    }


    /**
     * Marque un objet à insérer/mettre à jour dans la base
     * @param $object StorageItem objet entièrement paramétrer à enregistrer dans la persistence
     * @param $state int état de l'objet
     * @return mixed
     */
    public function persist(&$object, $state = StorageState::ToInsert)
    {
        if(isset($this->objects[get_class($object)]))
        {
            if($state > $object->State())
                $object->setState($state);
            $key = $object->id;
            if(isset($object->id) == false)
            {
                $key = "N".$this->index;
                $this->index = $this->index + 1;
            }
            $this->objects[get_class($object)][$key] = $object;
        }
        else
        {
            $this->objects[get_class($object)]  =array();
            $this->persist($object, $state);
        }
    }


    /**
     * Effectue tout les opérations de supression/mise à jour/insertion dans la persistence
     * @return mixed
     */
    public function flush()
    {

        foreach ($this->objects as $key => $table)
        {
            foreach ($table as $k => $entry)
            {
                //if(get_class($entry) == "StructureType")
                 //   print $k." = flushing: ".get_class($entry).$entry->Id()." state: ".$entry->State()."<br>";
                if($entry->State() === StorageState::ToInsert)
                {
                    $this->insert($entry);
                }
                else if($entry->State() === StorageState::ToUpdate)
                {
                    $this->update($entry);
                }
                else if($entry->State() === StorageState::ToDelete)
                {
                    //print "DELETING ".$key." ".$k."<br>";
                    $this->delete($entry);
                }
                foreach ($entry as $key => $value) {
                    if (is_array($value) == true)
                        $entry->unload($entry->$key);

                }
            }
        }

        $this->index = 0;
        // building cache with new indexes
        for($i = 0; $i != count($this->objects); $i++)
        {
            $table = array_keys($this->objects)[$i];
            for($u = 0; $u != count($this->objects[$table]); $u++)
            {
                $key = array_keys($this->objects[$table])[$u];
                //print $table." ".$key." / ";
                if(substr( $key, 0, 1 ) != "N") {
                    //print "Skipping<br>";
                    continue;
                }
                $entry = $this->objects[$table][$key];
                unset($this->objects[$table][$key]);
                $this->objects[$table][$entry->Id()] = $entry;
                //print $table." ".$entry->Id()."<br>";

            }
        }
    }

    private function delete(&$object)
    {
        //print "EXECUTING ".$object->id."<br>";

        $sql = "DELETE FROM ".get_class($object)." WHERE id=:id";
        //print $sql.$object->id."<br>";
        $data = array();
        $data[":id"] = $object->id;
        $request = $this->pdo->prepare($sql);
        $results = $request->execute($data);
        if($results != true)
            throw new Exception("An error occured while deleting from database.");
        unset($this->objects[get_class($object)][$object->id]);
    }

    private function update(&$object)
    {
        $sql = "UPDATE :table SET :values WHERE id=:id";
        $data = array();
        $data[":table"] = get_class($object);
        $data[":values"] = "";
        foreach ($object as $key => $value)
        {
            if(is_array($value))
                continue;
            if(!isset($value) || $value == NULL)
                continue;
            $data[":values"] .= $key." = '".$value."',";
        }
        $data[":values"] = substr($data[":values"], 0, -1);

        $sql = str_replace(":table", $data[":table"], $sql);
        $sql = str_replace(":values", $data[":values"], $sql);
        $request = $this->pdo->prepare($sql);
        $results = $request->execute([":id" => $object->id]);
        if($results != true)
            throw new Exception("An error occured while updating database.");
        $object->setState(StorageState::UpToDate);
    }

    private function insert(&$object)
    {
        $sql = "INSERT INTO :table (:fields) VALUES (:values)";
        $data = array();
        $data[":table"] = get_class($object);
        $data[":fields"] = "";
        $data[":values"] = "";
        foreach ($object as $key => $value)
        {
            if(is_array($value))
                continue;
            if(!isset($value) || $value == NULL)
                continue;
            $data[":fields"] .= $key.",";
            $data[":values"] .= "'".$value."',";
        }
        $data[":fields"] = substr($data[":fields"], 0, -1);
        $data[":values"] = substr($data[":values"], 0, -1);

        $sql = str_replace(":table", $data[":table"], $sql);
        $sql = str_replace(":fields", $data[":fields"], $sql);
        $sql = str_replace(":values", $data[":values"], $sql);
        $request = $this->pdo->prepare($sql);
        $results = $request->execute($data);
        if($results != true)
            throw new Exception("An error occured while inserting in database.");
        $object->id = $this->pdo->lastInsertId();
        $object->setState(StorageState::UpToDate);
    }

    /**
     * Récupère tout les instances de la table class existant dans la persistence
     * @param $class string de la table dans laquelle chercher
     * @param $destination array dans laquelle stocker les résultats
     * @return mixed
     * @throws
     */
    public function findAll($class, &$destination, $condition="")
    {
        $destination = array();
        $sql = "SELECT * from ".$class. "";
        if($condition != "")
        {
            $sql = $sql." WHERE ".$condition;
        }
        $request = $this->pdo->prepare($sql);
        $results = $request->execute();
        if($results != true)
            throw new Exception("An error occured while retrieving from database.");
        $results = $request->fetchAll();
        foreach ($results as $result) {
            $object = new $class($this);
            foreach ($object as $key => $value) {
                if (is_array($value) == false)
                    $object->$key = $result[$key];

            }
            $this->persist($object, StorageState::UpToDate);
            array_push($destination, $object);
        }
    }
}