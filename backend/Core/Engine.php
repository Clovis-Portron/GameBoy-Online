<?php

include_once 'addendum/annotations.php';
include_once 'Annotations.php';


include_once 'DatabaseStorage.php';
include_once "StorageItem.php";
session_start();

/**
 * Created by PhpStorm.
 * User: clovis
 * Date: 22/01/17
 * Time: 16:02
 */

class Engine
{

    private static $instance;
    public static $DEBUG = false;

    /**
     * @return Engine
     */
    public static function Instance()
    {
        if(isset(Engine::$instance) ==  false)
        {
            Engine::$instance = new Engine();
        }
        return Engine::$instance;
    }



    public static function autoload($class)
    {
        if(file_exists('Controllers/'.$class.'.php'))
            include_once 'Controllers/'.$class.'.php';
        else if(file_exists('Model/'.$class.'.php'))
            include_once 'Model/'.$class.'.php';
    }

    private $persistence;

    function __construct()
    {
        $this->persistence = array();
        spl_autoload_register('Engine::autoload');
        if(Engine::$DEBUG == true)
        {
            error_reporting(E_ALL);
            ini_set('display_errors', 1);
        }
    }

    public function setPersistence($storage)
    {
        $key = get_class($storage);
        if(isset($this->persistence[$key]))
            throw new Exception("you cant change persistence if already set.");
        if(!is_subclass_of($storage, "Storage"))
            throw new Exception("Must be a child class of Storage");
        $this->persistence[$key] = $storage;
    }

    /**
     * @param $class
     * @return DatabaseStorage
     * @throws Exception
     */
    public function getPersistence($class)
    {
        if(!isset($this->persistence[$class]))
            throw new Exception($class." not registered as Persistent Storage");
        return $this->persistence[$class];
    }
}
